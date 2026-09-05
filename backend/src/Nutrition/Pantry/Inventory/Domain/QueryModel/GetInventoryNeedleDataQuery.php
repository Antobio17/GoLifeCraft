<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel;

use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\GetInventoryResult;

interface GetInventoryNeedleDataQuery
{
    public function findInventoryById(string $inventoryId): ?GetInventoryResult;
}
