<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetProductionItemResult extends QueryAggregateResult
{
    /**
     * @param ProductionIngredientView[] $ingredients
     * @param ProductionSubRecipeView[]  $subRecipes
     * @param ProductionStepView[]       $steps
     * @param string[]                   $checkedArticleIds
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $productionId,
        public readonly string $recipeId,
        public readonly string $name,
        public readonly string $emoji,
        public readonly string $status,
        public readonly string $productionStatus,
        public readonly float $servingsPlanned,
        public readonly float $servingsCooked,
        public readonly int $recipeServings,
        public readonly array $checkedArticleIds,
        public readonly array $ingredients,
        public readonly array $subRecipes,
        public readonly array $steps,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
