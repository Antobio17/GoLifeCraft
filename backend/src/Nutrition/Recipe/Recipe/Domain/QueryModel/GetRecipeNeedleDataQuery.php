<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\GetRecipeResult;

interface GetRecipeNeedleDataQuery
{
    public function findRecipeById(string $recipeId): ?GetRecipeResult;
}
