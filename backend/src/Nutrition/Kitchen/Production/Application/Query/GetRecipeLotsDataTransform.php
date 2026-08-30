<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetRecipeLotsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetRecipeLotsDataTransform
{
    /**
     * @param GetRecipeLotsResult[] $lots
     */
    public function transform(array $lots): QueryResult;
}
