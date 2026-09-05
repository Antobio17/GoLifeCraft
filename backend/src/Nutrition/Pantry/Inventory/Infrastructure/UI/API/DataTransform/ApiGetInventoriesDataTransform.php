<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\UI\API\DataTransform;

use Nutrition\Pantry\Inventory\Application\Query\GetInventoriesDataTransform;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\GetInventoriesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetInventoriesDataTransform implements GetInventoriesDataTransform
{
    /**
     * @param GetInventoriesResult[] $inventories
     */
    public function transform(
        array $inventories,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $inventories,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
