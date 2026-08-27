<?php

namespace Nutrition\Pantry\RecipeStock\Domain\QueryModel;

interface UpdateRecipeStockNeedleDataQuery
{
    public function recipeExists(string $recipeId): bool;
}
