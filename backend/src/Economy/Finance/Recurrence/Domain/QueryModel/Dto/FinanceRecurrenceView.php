<?php

namespace Economy\Finance\Recurrence\Domain\QueryModel\Dto;

final readonly class FinanceRecurrenceView
{
    public function __construct(
        public string $id,
        public string $accountId,
        public string $accountName,
        public string $kind,
        public float $amount,
        public string $category,
        public string $note,
        public ?string $store,
        public int $dayOfMonth,
        public string $startMonth,
        public ?string $endMonth,
        public bool $active,
        public ?string $lastRunMonth,
        public ?string $nextChargeDate,
    ) {
    }
}
