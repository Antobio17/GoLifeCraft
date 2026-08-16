<?php

namespace Economy\Finance\Transaction\Domain\QueryModel\Dto;

final readonly class FinanceMonthPoint
{
    public function __construct(
        public string $month,
        public float $income,
        public float $expense,
        public float $net,
        public float $endBalance,
    ) {
    }
}
