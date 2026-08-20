<?php

namespace Economy\Finance\Budget\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetFinanceBudgetSettingsResult extends QueryAggregateResult
{
    /**
     * @param FinanceBudgetCategorySetting[] $categories
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly bool $configured,
        public readonly float $referenceIncome,
        public readonly float $suggestedIncome,
        public readonly float $savingsPercentage,
        public readonly float $savingsAmount,
        public readonly float $allocatedAmount,
        public readonly float $unassignedAmount,
        public readonly float $unassignedPercentage,
        public readonly array $categories,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
