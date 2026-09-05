<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel;

use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\GetInventoriesResult;

interface GetInventoriesNeedleDataQuery
{
    /**
     * @return GetInventoriesResult[]
     */
    public function findInventories(
        int $pageSize,
        int $pageNumber,
        ?string $filterShift = null,
        ?string $filterStatus = null,
        ?string $orderBy = null,
    ): array;

    public function totalInventories(
        ?string $filterShift = null,
        ?string $filterStatus = null,
    ): int;
}
