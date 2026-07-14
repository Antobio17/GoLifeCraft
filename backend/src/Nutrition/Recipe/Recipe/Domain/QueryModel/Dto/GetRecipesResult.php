<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetRecipesResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $name,
        public readonly string $emoji,
        public readonly string $category,
        public readonly int $servings,
        public readonly int $ingredientCount,
        public readonly bool $hasSubRecipe,
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
