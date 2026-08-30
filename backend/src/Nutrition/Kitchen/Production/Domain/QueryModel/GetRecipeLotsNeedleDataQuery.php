<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetRecipeLotsResult;

interface GetRecipeLotsNeedleDataQuery
{
    /**
     * Every cooked batch of a recipe, newest first, with the day it was cooked and what is left of
     * it. Nothing is hidden: whoever is picking says what they ate, and the dates are on the list.
     *
     * @return GetRecipeLotsResult[]
     */
    public function findLots(string $recipeId): array;
}
