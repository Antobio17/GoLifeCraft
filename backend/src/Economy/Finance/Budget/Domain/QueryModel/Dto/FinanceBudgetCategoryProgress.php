<?php

namespace Economy\Finance\Budget\Domain\QueryModel\Dto;

final readonly class FinanceBudgetCategoryProgress
{
    public function __construct(
        public string $category,
        public string $kind,
        public float $budget,
        public float $spent,
        public float $expected,
        public float $difference,
        public float $remaining,
        public float $progress,
        public string $status,
    ) {
    }
}
