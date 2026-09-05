<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\UI\API\DataTransform;

use Nutrition\Pantry\Inventory\Application\Query\GetInventoryDataTransform;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\GetInventoryResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetInventoryDataTransform implements GetInventoryDataTransform
{
    public function transform(GetInventoryResult $inventory): QueryResult
    {
        return new QuerySingleResult(item: $inventory);
    }
}
