<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionNeeds;

interface CookProductionItemNeedleDataQuery
{
    public function resolveNeeds(string $recipeId, float $servings): ProductionNeeds;
}
