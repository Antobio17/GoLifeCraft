<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;

interface FinishProductionNeedleDataQuery
{
    /**
     * Flattens the recipe down to articles, nested sub-recipes included, scaled to the servings
     * actually cooked.
     *
     * @return ProductionIngredient[]
     */
    public function resolveIngredients(string $recipeId, float $servings): array;
}
