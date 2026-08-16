<?php

namespace Economy\Finance\Transaction\Domain\QueryModel\Dto;

final readonly class FinanceSubscription
{
    public function __construct(
        public string $note,
        public float $amount,
        public string $category,
        public int $chargeDay,
    ) {
    }
}
