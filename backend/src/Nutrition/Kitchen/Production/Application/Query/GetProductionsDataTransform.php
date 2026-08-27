<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetProductionsDataTransform
{
    /**
     * @param GetProductionsResult[] $productions
     */
    public function transform(
        array $productions,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
