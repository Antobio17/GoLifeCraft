<?php

namespace Economy\Finance\Transaction\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\FinanceCalendarDay;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceCalendarResult;
use Economy\Finance\Transaction\Domain\QueryModel\GetFinanceCalendarNeedleDataQuery;

final readonly class DoctrineGetFinanceCalendarNeedleDataQuery implements GetFinanceCalendarNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findCalendar(string $month): GetFinanceCalendarResult
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                't.transaction_date',
                't.kind',
                'SUM(t.amount) AS total',
                'COUNT(t.id) AS movements',
            )
            ->from(table: 'finance_transaction', alias: 't')
            ->where('SUBSTRING(t.transaction_date, 1, 7) = :month')
            ->setParameter(key: 'month', value: $month)
            ->groupBy('t.transaction_date', 't.kind')
            ->orderBy('t.transaction_date', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $buckets = [];

        foreach ($rows as $row) {
            $date = (string) $row['transaction_date'];
            $buckets[$date] ??= ['expense' => 0.0, 'income' => 0.0, 'count' => 0];
            $bucket = FinanceTransaction::KIND_INCOME === $row['kind'] ? 'income' : 'expense';
            $buckets[$date][$bucket] += (float) $row['total'];
            $buckets[$date]['count'] += (int) $row['movements'];
        }

        $days = [];
        $expense = 0.0;
        $income = 0.0;

        foreach ($buckets as $date => $bucket) {
            $expense += $bucket['expense'];
            $income += $bucket['income'];

            $days[] = new FinanceCalendarDay(
                date: (string) $date,
                expense: round(num: $bucket['expense'], precision: 2),
                income: round(num: $bucket['income'], precision: 2),
                transactionCount: $bucket['count'],
            );
        }

        return new GetFinanceCalendarResult(
            id: $month,
            aggregateName: 'FinanceCalendar',
            month: $month,
            days: $days,
            expense: round(num: $expense, precision: 2),
            income: round(num: $income, precision: 2),
        );
    }
}
