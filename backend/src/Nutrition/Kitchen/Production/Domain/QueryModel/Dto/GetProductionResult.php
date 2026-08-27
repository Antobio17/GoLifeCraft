<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetProductionResult extends QueryAggregateResult
{
    /**
     * @param ProductionIngredientView[] $ingredients
     * @param ProductionStepView[]       $steps
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $recipeId,
        public readonly string $name,
        public readonly string $emoji,
        public readonly string $cookDate,
        public readonly string $status,
        public readonly float $servingsCooked,
        public readonly int $recipeServings,
        public readonly array $ingredients,
        public readonly array $steps,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
