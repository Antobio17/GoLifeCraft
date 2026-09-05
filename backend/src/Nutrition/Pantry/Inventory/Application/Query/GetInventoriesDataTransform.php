<?php

namespace Nutrition\Pantry\Inventory\Application\Query;

use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\GetInventoriesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetInventoriesDataTransform
{
    /**
     * @param GetInventoriesResult[] $inventories
     */
    public function transform(
        array $inventories,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
