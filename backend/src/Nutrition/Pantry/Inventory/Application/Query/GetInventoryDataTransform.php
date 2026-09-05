<?php

namespace Nutrition\Pantry\Inventory\Application\Query;

use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\GetInventoryResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetInventoryDataTransform
{
    public function transform(GetInventoryResult $inventory): QueryResult;
}
