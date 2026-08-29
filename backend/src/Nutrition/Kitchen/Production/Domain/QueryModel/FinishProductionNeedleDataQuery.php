<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionNeeds;

interface FinishProductionNeedleDataQuery
{
    public function resolveNeeds(string $recipeId, float $servings): ProductionNeeds;

    /**
     * @return int[]
     */
    public function stepPositions(string $recipeId): array;
}
