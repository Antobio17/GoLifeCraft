<?php

namespace Economy\Finance\Recurrence\Application\Query;

use Economy\Finance\Recurrence\Domain\QueryModel\Dto\PendingFinanceRecurrenceBooking;
use Economy\Finance\Recurrence\Domain\QueryModel\PendingFinanceRecurrencesNeedleDataQuery;
use Economy\Finance\Recurrence\Domain\Service\FinanceRecurrenceCalendar;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class GetPendingFinanceRecurrenceBookingsQueryHandler
{
    public function __construct(
        private PendingFinanceRecurrencesNeedleDataQuery $needleDataQuery,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    /**
     * @return PendingFinanceRecurrenceBooking[]
     */
    public function __invoke(GetPendingFinanceRecurrenceBookingsQuery $query): array
    {
        $today = $query->today ?? $this->dateTimeGenerator->now()->format(format: 'Y-m-d');
        $bookings = [];

        foreach ($this->needleDataQuery->findPending(today: $today) as $pendingRecurrence) {
            $months = FinanceRecurrenceCalendar::monthsToBook(
                months: $pendingRecurrence->months,
                today: $today,
                onlyCurrentMonth: $query->onlyCurrentMonth,
            );

            foreach ($months as $month) {
                $bookings[] = new PendingFinanceRecurrenceBooking(
                    financeRecurrenceId: $pendingRecurrence->id,
                    note: $pendingRecurrence->note,
                    month: $month,
                    today: $today,
                );
            }
        }

        return $bookings;
    }
}
