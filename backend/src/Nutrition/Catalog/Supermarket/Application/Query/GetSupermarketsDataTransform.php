<?php

namespace Nutrition\Catalog\Supermarket\Application\Query;

use Nutrition\Catalog\Supermarket\Domain\QueryModel\Dto\GetSupermarketsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetSupermarketsDataTransform
{
    /**
     * @param GetSupermarketsResult[] $supermarkets
     */
    public function transform(
        array $supermarkets,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
