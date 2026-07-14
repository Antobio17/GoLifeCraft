<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetRecipeResult extends QueryAggregateResult
{
    /**
     * @param RecipeIngredientView[] $ingredients
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $name,
        public readonly string $emoji,
        public readonly string $category,
        public readonly int $servings,
        public readonly array $ingredients,
        public readonly MacroBreakdown $total,
        public readonly MacroBreakdown $perServing,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
