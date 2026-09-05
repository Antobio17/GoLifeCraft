<?php

namespace Nutrition\Pantry\Inventory\Application\Query;

use Nutrition\Pantry\Inventory\Domain\Exception\GetInventoryException;
use Nutrition\Pantry\Inventory\Domain\QueryModel\GetInventoryNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetInventoryQueryHandler
{
    public function __construct(
        private GetInventoryNeedleDataQuery $needleDataQuery,
        private GetInventoryDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetInventoryQuery $query): QueryResult
    {
        $inventory = $this->needleDataQuery->findInventoryById(inventoryId: $query->inventoryId);

        if (null === $inventory) {
            throw GetInventoryException::notFound(inventoryId: $query->inventoryId);
        }

        return $this->dataTransform->transform(inventory: $inventory);
    }
}
