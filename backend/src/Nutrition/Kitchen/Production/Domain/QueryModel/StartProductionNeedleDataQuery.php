<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionRecipeSnapshot;

interface StartProductionNeedleDataQuery
{
    public function findRecipeSnapshot(string $recipeId): ?ProductionRecipeSnapshot;
}
