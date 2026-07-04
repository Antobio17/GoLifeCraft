<?php

namespace Nutrition\Catalog\Category\Application\Query;

use Nutrition\Catalog\Category\Domain\QueryModel\Dto\GetCategoriesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetCategoriesDataTransform
{
    /**
     * @param GetCategoriesResult[] $categories
     */
    public function transform(
        array $categories,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
