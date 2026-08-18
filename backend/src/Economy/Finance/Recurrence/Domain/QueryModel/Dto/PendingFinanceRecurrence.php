<?php

namespace Economy\Finance\Recurrence\Domain\QueryModel\Dto;

final readonly class PendingFinanceRecurrence
{
    /**
     * @param array<int, string> $months
     */
    public function __construct(
        public string $id,
        public string $note,
        public array $months,
    ) {
    }
}
