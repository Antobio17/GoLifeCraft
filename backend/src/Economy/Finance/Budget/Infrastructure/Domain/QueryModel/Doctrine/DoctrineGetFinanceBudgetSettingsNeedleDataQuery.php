<?php

namespace Economy\Finance\Budget\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Budget\Domain\Model\FinanceBudgetCategory;
use Economy\Finance\Budget\Domain\QueryModel\Dto\FinanceBudgetCategorySetting;
use Economy\Finance\Budget\Domain\QueryModel\Dto\GetFinanceBudgetSettingsResult;
use Economy\Finance\Budget\Domain\QueryModel\GetFinanceBudgetSettingsNeedleDataQuery;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;

final readonly class DoctrineGetFinanceBudgetSettingsNeedleDataQuery implements GetFinanceBudgetSettingsNeedleDataQuery
{
    private const SUGGESTION_MONTHS = 3;
    private const SUGGESTION_LOOKBACK_MONTHS = 12;

    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findSettings(string $month): GetFinanceBudgetSettingsResult
    {
        $budget = $this->findBudgetRow();
        $stored = null === $budget ? [] : $this->findStoredCategories(budgetId: (string) $budget['id']);
        $suggestedIncome = $this->buildSuggestedIncome(month: $month);

        $referenceIncome = null === $budget
            ? $suggestedIncome
            : round(num: (float) $budget['reference_income'], precision: 2);
        $savingsPercentage = null === $budget
            ? 0.0
            : round(num: (float) $budget['savings_percentage'], precision: 2);
        $savingsAmount = round(num: $referenceIncome * $savingsPercentage / 100, precision: 2);

        $categories = [];
        $allocated = $savingsAmount;

        foreach (FinanceTransaction::CATEGORIES as $category) {
            $setting = $stored[$category] ?? [
                'kind' => FinanceBudgetCategory::KIND_VARIABLE,
                'amount' => 0.0,
            ];
            $allocated += $setting['amount'];

            $categories[] = new FinanceBudgetCategorySetting(
                category: $category,
                kind: $setting['kind'],
                amount: $setting['amount'],
                percentage: $this->percentageOf(amount: $setting['amount'], referenceIncome: $referenceIncome),
            );
        }

        $allocated = round(num: $allocated, precision: 2);
        $unassignedAmount = round(num: $referenceIncome - $allocated, precision: 2);

        return new GetFinanceBudgetSettingsResult(
            id: 'settings',
            aggregateName: 'FinanceBudgetSettings',
            configured: null !== $budget,
            referenceIncome: $referenceIncome,
            suggestedIncome: $suggestedIncome,
            savingsPercentage: $savingsPercentage,
            savingsAmount: $savingsAmount,
            allocatedAmount: $allocated,
            unassignedAmount: $unassignedAmount,
            unassignedPercentage: $this->percentageOf(
                amount: $unassignedAmount,
                referenceIncome: $referenceIncome,
            ),
            categories: $categories,
        );
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findBudgetRow(): ?array
    {
        $budget = $this->connection->createQueryBuilder()
            ->select('b.id', 'b.reference_income', 'b.savings_percentage')
            ->from(table: 'finance_budget', alias: 'b')
            ->orderBy('b.created_at', 'ASC')
            ->setMaxResults(1)
            ->executeQuery()
            ->fetchAssociative();

        return false === $budget ? null : $budget;
    }

    /**
     * @return array<string, array{kind: string, amount: float}>
     */
    private function findStoredCategories(string $budgetId): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('c.category', 'c.kind', 'c.amount')
            ->from(table: 'finance_budget_category', alias: 'c')
            ->where('c.budget_id = :budgetId')
            ->setParameter(key: 'budgetId', value: $budgetId)
            ->executeQuery()
            ->fetchAllAssociative();

        $categories = [];

        foreach ($rows as $row) {
            $categories[(string) $row['category']] = [
                'kind' => (string) $row['kind'],
                'amount' => round(num: (float) $row['amount'], precision: 2),
            ];
        }

        return $categories;
    }

    /**
     * Average of the three latest months that booked income, which for most users
     * is the average of their last three payslips.
     */
    private function buildSuggestedIncome(string $month): float
    {
        $firstMonth = (new \DateTimeImmutable(datetime: $month.'-01'))
            ->modify(modifier: sprintf('-%d months', self::SUGGESTION_LOOKBACK_MONTHS))
            ->format(format: 'Y-m');

        $rows = $this->connection->createQueryBuilder()
            ->select('SUBSTRING(t.transaction_date, 1, 7) AS month', 'SUM(t.amount) AS total')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('t.kind = :kind')
            ->andWhere('SUBSTRING(t.transaction_date, 1, 7) <= :month')
            ->andWhere('SUBSTRING(t.transaction_date, 1, 7) >= :firstMonth')
            ->setParameter(key: 'kind', value: FinanceTransaction::KIND_INCOME)
            ->setParameter(key: 'month', value: $month)
            ->setParameter(key: 'firstMonth', value: $firstMonth)
            ->groupBy('month')
            ->orderBy('month', 'DESC')
            ->setMaxResults(self::SUGGESTION_MONTHS)
            ->executeQuery()
            ->fetchAllAssociative();

        $incomes = [];

        foreach ($rows as $row) {
            $total = (float) $row['total'];

            if ($total > 0) {
                $incomes[] = $total;
            }
        }

        return [] === $incomes
            ? 0.0
            : round(num: array_sum(array: $incomes) / count(value: $incomes), precision: 2);
    }

    private function percentageOf(float $amount, float $referenceIncome): float
    {
        return $referenceIncome > 0 ? round(num: $amount / $referenceIncome * 100, precision: 2) : 0.0;
    }
}
