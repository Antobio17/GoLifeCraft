<?php

namespace Economy\Finance\Budget\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Budget\Domain\Model\FinanceBudgetCategory;
use Economy\Finance\Budget\Domain\QueryModel\Dto\FinanceBudgetCategoryProgress;
use Economy\Finance\Budget\Domain\QueryModel\Dto\GetFinanceBudgetResult;
use Economy\Finance\Budget\Domain\QueryModel\GetFinanceBudgetNeedleDataQuery;
use Economy\Finance\Budget\Domain\Service\FinanceBudgetPace;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;

final readonly class DoctrineGetFinanceBudgetNeedleDataQuery implements GetFinanceBudgetNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findBudget(string $month, string $today): GetFinanceBudgetResult
    {
        $budget = $this->findConfiguration();
        $monthProgress = FinanceBudgetPace::monthProgress(month: $month, today: $today);
        $spentByCategory = $this->findSpentByCategory(month: $month);
        $totals = $this->findMonthTotals(month: $month);

        $variableCategories = [];
        $fixedCategories = [];
        $variableBudget = 0.0;
        $variableSpent = 0.0;

        foreach ($budget['categories'] as $category) {
            $spent = $spentByCategory[$category['category']] ?? 0.0;
            $progress = $this->buildProgress(
                category: $category,
                spent: $spent,
                monthProgress: $monthProgress,
            );

            if (FinanceBudgetCategory::KIND_FIXED === $category['kind']) {
                $fixedCategories[] = $progress;

                continue;
            }

            $variableCategories[] = $progress;
            $variableBudget += $category['amount'];
            $variableSpent += $spent;
        }

        usort(array: $variableCategories, callback: self::byUrgency(...));

        $savingsObjective = round(
            num: $budget['referenceIncome'] * $budget['savingsPercentage'] / 100,
            precision: 2,
        );
        $savingsReal = round(num: $totals['income'] - $totals['expense'], precision: 2);

        return new GetFinanceBudgetResult(
            id: $month,
            aggregateName: 'FinanceBudget',
            month: $month,
            configured: $budget['configured'],
            dayOfMonth: FinanceBudgetPace::dayOfMonth(month: $month, today: $today),
            daysInMonth: FinanceBudgetPace::daysInMonth(month: $month),
            monthProgress: $monthProgress,
            referenceIncome: $budget['referenceIncome'],
            savingsPercentage: $budget['savingsPercentage'],
            savingsObjective: $savingsObjective,
            savingsReal: $savingsReal,
            savingsProgress: FinanceBudgetPace::progress(budget: $savingsObjective, spent: max(0.0, $savingsReal)),
            savingsStatus: FinanceBudgetPace::savingsStatus(
                objective: $savingsObjective,
                saved: $savingsReal,
                monthProgress: $monthProgress,
            ),
            variableBudget: round(num: $variableBudget, precision: 2),
            variableSpent: round(num: $variableSpent, precision: 2),
            variableExpected: FinanceBudgetPace::expected(budget: $variableBudget, monthProgress: $monthProgress),
            variableDifference: FinanceBudgetPace::difference(
                budget: $variableBudget,
                spent: $variableSpent,
                monthProgress: $monthProgress,
            ),
            variableRemaining: round(num: $variableBudget - $variableSpent, precision: 2),
            variableProgress: FinanceBudgetPace::progress(budget: $variableBudget, spent: $variableSpent),
            variableStatus: FinanceBudgetPace::status(
                budget: $variableBudget,
                spent: $variableSpent,
                monthProgress: $monthProgress,
            ),
            variableCategories: $variableCategories,
            fixedCategories: $fixedCategories,
        );
    }

    /**
     * The category closest to burning its cap goes first; ties are broken by the
     * one holding more money, which is the one worth reacting to.
     */
    private static function byUrgency(
        FinanceBudgetCategoryProgress $first,
        FinanceBudgetCategoryProgress $second,
    ): int {
        $byProgress = $second->progress <=> $first->progress;

        return 0 !== $byProgress ? $byProgress : $second->spent <=> $first->spent;
    }

    /**
     * @param array{category: string, kind: string, amount: float} $category
     */
    private function buildProgress(array $category, float $spent, float $monthProgress): FinanceBudgetCategoryProgress
    {
        return new FinanceBudgetCategoryProgress(
            category: $category['category'],
            kind: $category['kind'],
            budget: $category['amount'],
            spent: round(num: $spent, precision: 2),
            expected: FinanceBudgetPace::expected(budget: $category['amount'], monthProgress: $monthProgress),
            difference: FinanceBudgetPace::difference(
                budget: $category['amount'],
                spent: $spent,
                monthProgress: $monthProgress,
            ),
            remaining: round(num: $category['amount'] - $spent, precision: 2),
            progress: FinanceBudgetPace::progress(budget: $category['amount'], spent: $spent),
            status: FinanceBudgetPace::status(
                budget: $category['amount'],
                spent: $spent,
                monthProgress: $monthProgress,
            ),
        );
    }

    /**
     * @return array{configured: bool, referenceIncome: float, savingsPercentage: float, categories: array<int, array{category: string, kind: string, amount: float}>}
     */
    private function findConfiguration(): array
    {
        $budget = $this->connection->createQueryBuilder()
            ->select('b.id', 'b.reference_income', 'b.savings_percentage')
            ->from(table: 'finance_budget', alias: 'b')
            ->orderBy('b.created_at', 'ASC')
            ->setMaxResults(1)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $budget) {
            return [
                'configured' => false,
                'referenceIncome' => 0.0,
                'savingsPercentage' => 0.0,
                'categories' => [],
            ];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('c.category', 'c.kind', 'c.amount')
            ->from(table: 'finance_budget_category', alias: 'c')
            ->where('c.budget_id = :budgetId')
            ->andWhere('c.amount > 0')
            ->setParameter(key: 'budgetId', value: $budget['id'])
            ->orderBy('c.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $categories = [];

        foreach ($rows as $row) {
            $categories[] = [
                'category' => (string) $row['category'],
                'kind' => (string) $row['kind'],
                'amount' => round(num: (float) $row['amount'], precision: 2),
            ];
        }

        return [
            'configured' => true,
            'referenceIncome' => round(num: (float) $budget['reference_income'], precision: 2),
            'savingsPercentage' => round(num: (float) $budget['savings_percentage'], precision: 2),
            'categories' => $categories,
        ];
    }

    /**
     * @return array<string, float>
     */
    private function findSpentByCategory(string $month): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.category', 'SUM(t.amount) AS total')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('SUBSTRING(t.transaction_date, 1, 7) = :month')
            ->andWhere('t.kind = :kind')
            ->setParameter(key: 'month', value: $month)
            ->setParameter(key: 'kind', value: FinanceTransaction::KIND_EXPENSE)
            ->groupBy('t.category')
            ->executeQuery()
            ->fetchAllAssociative();

        $totals = [];

        foreach ($rows as $row) {
            $totals[(string) $row['category']] = round(num: (float) $row['total'], precision: 2);
        }

        return $totals;
    }

    /**
     * @return array{income: float, expense: float}
     */
    private function findMonthTotals(string $month): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.kind', 'SUM(t.amount) AS total')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('SUBSTRING(t.transaction_date, 1, 7) = :month')
            ->setParameter(key: 'month', value: $month)
            ->groupBy('t.kind')
            ->executeQuery()
            ->fetchAllAssociative();

        $totals = ['income' => 0.0, 'expense' => 0.0];

        foreach ($rows as $row) {
            $bucket = FinanceTransaction::KIND_INCOME === $row['kind'] ? 'income' : 'expense';
            $totals[$bucket] += (float) $row['total'];
        }

        return $totals;
    }
}
