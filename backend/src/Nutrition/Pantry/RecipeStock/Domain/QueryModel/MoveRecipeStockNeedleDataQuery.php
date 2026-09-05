<?php

namespace Nutrition\Pantry\RecipeStock\Domain\QueryModel;

interface MoveRecipeStockNeedleDataQuery
{
    public function recipeExists(string $recipeId): bool;

    public function locationExists(string $locationId): bool;
}
