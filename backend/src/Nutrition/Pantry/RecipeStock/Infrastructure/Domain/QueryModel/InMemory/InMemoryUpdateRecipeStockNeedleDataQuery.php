<?php

namespace Nutrition\Pantry\RecipeStock\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\RecipeStock\Domain\QueryModel\UpdateRecipeStockNeedleDataQuery;

final class InMemoryUpdateRecipeStockNeedleDataQuery implements UpdateRecipeStockNeedleDataQuery
{
    /**
     * @param string[] $recipeIds
     */
    public function __construct(private array $recipeIds = [])
    {
    }

    public function recipeExists(string $recipeId): bool
    {
        return in_array($recipeId, $this->recipeIds, true);
    }
}
