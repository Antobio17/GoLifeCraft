<?php

namespace Economy\Finance\Recurrence\Domain\QueryModel\Dto;

final readonly class PendingFinanceRecurrenceBooking
{
    public function __construct(
        public string $financeRecurrenceId,
        public string $note,
        public string $month,
        public string $today,
    ) {
    }
}
