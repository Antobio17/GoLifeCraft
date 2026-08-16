<?php

namespace Economy\Finance\Transaction\Domain\QueryModel\Dto;

final readonly class FinanceCategoryTotal
{
    public function __construct(
        public string $category,
        public float $amount,
        public float $percentage,
    ) {
    }
}
