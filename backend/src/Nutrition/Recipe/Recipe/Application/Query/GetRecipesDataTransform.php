<?php

namespace Nutrition\Recipe\Recipe\Application\Query;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\GetRecipesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetRecipesDataTransform
{
    /**
     * @param GetRecipesResult[] $recipes
     */
    public function transform(
        array $recipes,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
