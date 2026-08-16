<?php

namespace Economy\Finance\Transaction\Domain\QueryModel\Dto;

final readonly class FinanceCalendarDay
{
    public function __construct(
        public string $date,
        public float $expense,
        public float $income,
        public int $transactionCount,
    ) {
    }
}
