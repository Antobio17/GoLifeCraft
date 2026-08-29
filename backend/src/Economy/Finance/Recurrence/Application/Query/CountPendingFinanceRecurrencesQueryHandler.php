<?php

namespace Economy\Finance\Recurrence\Application\Query;

use Economy\Finance\Recurrence\Domain\QueryModel\PendingFinanceRecurrencesNeedleDataQuery;
use Economy\Finance\Recurrence\Domain\Service\FinanceRecurrenceCalendar;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CountPendingFinanceRecurrencesQueryHandler
{
    public function __construct(
        private PendingFinanceRecurrencesNeedleDataQuery $needleDataQuery,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CountPendingFinanceRecurrencesQuery $query): int
    {
        $today = $query->today ?? $this->dateTimeGenerator->now()->format(format: 'Y-m-d');
        $pending = 0;

        foreach ($this->needleDataQuery->findPending(today: $today) as $pendingRecurrence) {
            $pending += count(value: FinanceRecurrenceCalendar::monthsToBook(
                months: $pendingRecurrence->months,
                today: $today,
                onlyCurrentMonth: $query->onlyCurrentMonth,
            ));
        }

        return $pending;
    }
}
