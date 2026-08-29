<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionNeeds;

interface FinishProductionNeedleDataQuery
{
    /**
     * What cooking these servings consumes directly: the recipe's own articles and the servings of
     * the recipes it uses as ingredients.
     */
    public function resolveNeeds(string $recipeId, float $servings): ProductionNeeds;

    /**
     * Positions of the recipe steps, so finishing a recipe can tick them all off.
     *
     * @return int[]
     */
    public function stepPositions(string $recipeId): array;
}
