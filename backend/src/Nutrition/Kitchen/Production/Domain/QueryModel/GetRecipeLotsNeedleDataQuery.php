<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetRecipeLotsResult;

interface GetRecipeLotsNeedleDataQuery
{
    /**
     * @return GetRecipeLotsResult[]
     */
    public function findLots(string $recipeId): array;
}
