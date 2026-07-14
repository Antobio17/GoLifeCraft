<?php

namespace Nutrition\Recipe\Recipe\Application\Query;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\GetRecipeResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetRecipeDataTransform
{
    public function transform(GetRecipeResult $recipe): QueryResult;
}
