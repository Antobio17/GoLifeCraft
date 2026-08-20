<?php

namespace Economy\Finance\Budget\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetFinanceBudgetResult extends QueryAggregateResult
{
    /**
     * @param FinanceBudgetCategoryProgress[] $variableCategories
     * @param FinanceBudgetCategoryProgress[] $fixedCategories
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $month,
        public readonly bool $configured,
        public readonly int $dayOfMonth,
        public readonly int $daysInMonth,
        public readonly float $monthProgress,
        public readonly float $referenceIncome,
        public readonly float $savingsPercentage,
        public readonly float $savingsObjective,
        public readonly float $savingsReal,
        public readonly float $savingsProgress,
        public readonly string $savingsStatus,
        public readonly float $variableBudget,
        public readonly float $variableSpent,
        public readonly float $variableExpected,
        public readonly float $variableDifference,
        public readonly float $variableRemaining,
        public readonly float $variableProgress,
        public readonly string $variableStatus,
        public readonly array $variableCategories,
        public readonly array $fixedCategories,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
