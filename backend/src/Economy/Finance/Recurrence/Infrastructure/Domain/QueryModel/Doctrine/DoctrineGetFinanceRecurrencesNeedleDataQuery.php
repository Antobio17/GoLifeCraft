<?php

namespace Economy\Finance\Recurrence\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Recurrence\Domain\QueryModel\Dto\FinanceRecurrenceView;
use Economy\Finance\Recurrence\Domain\QueryModel\Dto\GetFinanceRecurrencesResult;
use Economy\Finance\Recurrence\Domain\QueryModel\GetFinanceRecurrencesNeedleDataQuery;
use Economy\Finance\Recurrence\Domain\Service\FinanceRecurrenceCalendar;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;

final readonly class DoctrineGetFinanceRecurrencesNeedleDataQuery implements GetFinanceRecurrencesNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findRecurrences(?string $accountId): GetFinanceRecurrencesResult
    {
        $recurrences = [];
        $monthlyIncome = 0.0;
        $monthlyExpense = 0.0;

        foreach ($this->findRows(accountId: $accountId) as $row) {
            $recurrence = $this->buildView(row: $row);
            $recurrences[] = $recurrence;

            if (!$recurrence->active) {
                continue;
            }

            if (FinanceTransaction::KIND_INCOME === $recurrence->kind) {
                $monthlyIncome += $recurrence->amount;

                continue;
            }

            $monthlyExpense += $recurrence->amount;
        }

        return new GetFinanceRecurrencesResult(
            id: $accountId ?? 'all',
            aggregateName: 'FinanceRecurrences',
            accountId: $accountId,
            recurrences: $recurrences,
            monthlyIncome: round(num: $monthlyIncome, precision: 2),
            monthlyExpense: round(num: $monthlyExpense, precision: 2),
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function findRows(?string $accountId): array
    {
        $queryBuilder = $this->connection->createQueryBuilder()
            ->select(
                'r.id',
                'r.account_id',
                'r.kind',
                'r.amount',
                'r.category',
                'r.note',
                'r.store',
                'r.day_of_month',
                'r.start_month',
                'r.end_month',
                'r.active',
                'r.last_run_month',
                'a.name AS account_name',
            )
            ->from(table: 'finance_recurrence', alias: 'r')
            ->innerJoin('r', 'finance_account', 'a', 'a.id = r.account_id')
            ->orderBy('r.active', 'DESC')
            ->addOrderBy('r.day_of_month', 'ASC')
            ->addOrderBy('r.note', 'ASC');

        if (null !== $accountId) {
            $queryBuilder
                ->where('r.account_id = :accountId')
                ->setParameter(key: 'accountId', value: $accountId);
        }

        return $queryBuilder->executeQuery()->fetchAllAssociative();
    }

    /**
     * @param array<string, mixed> $row
     */
    private function buildView(array $row): FinanceRecurrenceView
    {
        $endMonth = null !== $row['end_month'] ? (string) $row['end_month'] : null;
        $lastRunMonth = null !== $row['last_run_month'] ? (string) $row['last_run_month'] : null;

        return new FinanceRecurrenceView(
            id: (string) $row['id'],
            accountId: (string) $row['account_id'],
            accountName: (string) $row['account_name'],
            kind: (string) $row['kind'],
            amount: round(num: (float) $row['amount'], precision: 2),
            category: (string) $row['category'],
            note: (string) $row['note'],
            store: null !== $row['store'] ? (string) $row['store'] : null,
            dayOfMonth: (int) $row['day_of_month'],
            startMonth: (string) $row['start_month'],
            endMonth: $endMonth,
            active: (bool) $row['active'],
            lastRunMonth: $lastRunMonth,
            nextChargeDate: FinanceRecurrenceCalendar::nextChargeDate(
                startMonth: (string) $row['start_month'],
                endMonth: $endMonth,
                lastRunMonth: $lastRunMonth,
                dayOfMonth: (int) $row['day_of_month'],
            ),
        );
    }
}
