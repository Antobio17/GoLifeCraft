<?php

namespace Economy\Finance\Recurrence\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Recurrence\Domain\QueryModel\Dto\PendingFinanceRecurrence;
use Economy\Finance\Recurrence\Domain\QueryModel\PendingFinanceRecurrencesNeedleDataQuery;
use Economy\Finance\Recurrence\Domain\Service\FinanceRecurrenceCalendar;

final readonly class DoctrinePendingFinanceRecurrencesNeedleDataQuery implements PendingFinanceRecurrencesNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findPending(string $today): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('r.id', 'r.note', 'r.day_of_month', 'r.start_month', 'r.end_month', 'r.last_run_month')
            ->from(table: 'finance_recurrence', alias: 'r')
            ->where('r.active = :active')
            ->andWhere('r.start_month <= :month')
            ->andWhere('(r.last_run_month IS NULL OR r.last_run_month < :month)')
            ->setParameter(key: 'active', value: true)
            ->setParameter(key: 'month', value: FinanceRecurrenceCalendar::monthOf(date: $today))
            ->orderBy('r.day_of_month', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $pending = [];

        foreach ($rows as $row) {
            $months = FinanceRecurrenceCalendar::pendingMonths(
                startMonth: (string) $row['start_month'],
                endMonth: null !== $row['end_month'] ? (string) $row['end_month'] : null,
                lastRunMonth: null !== $row['last_run_month'] ? (string) $row['last_run_month'] : null,
                dayOfMonth: (int) $row['day_of_month'],
                today: $today,
            );

            if ([] === $months) {
                continue;
            }

            $pending[] = new PendingFinanceRecurrence(
                id: (string) $row['id'],
                note: (string) $row['note'],
                months: $months,
            );
        }

        return $pending;
    }
}
