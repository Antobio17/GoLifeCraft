<?php

namespace Economy\Finance\Budget\Domain\QueryModel\Dto;

final readonly class FinanceBudgetCategorySetting
{
    public function __construct(
        public string $category,
        public string $kind,
        public float $amount,
        public float $percentage,
    ) {
    }
}
