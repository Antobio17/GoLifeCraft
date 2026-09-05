<?php

namespace Nutrition\Pantry\RecipeStock\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\RecipeStock\Domain\QueryModel\MoveRecipeStockNeedleDataQuery;

final class InMemoryMoveRecipeStockNeedleDataQuery implements MoveRecipeStockNeedleDataQuery
{
    /**
     * @param string[] $recipeIds
     * @param string[] $locationIds
     */
    public function __construct(
        private array $recipeIds = [],
        private array $locationIds = [],
    ) {
    }

    public function recipeExists(string $recipeId): bool
    {
        return in_array(needle: $recipeId, haystack: $this->recipeIds, strict: true);
    }

    public function locationExists(string $locationId): bool
    {
        return in_array(needle: $locationId, haystack: $this->locationIds, strict: true);
    }
}
