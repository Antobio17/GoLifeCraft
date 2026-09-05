<?php

namespace Nutrition\Pantry\Location\Infrastructure\UI\API\DataTransform;

use Nutrition\Pantry\Location\Application\Query\GetLocationItemsDataTransform;
use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationItemsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetLocationItemsDataTransform implements GetLocationItemsDataTransform
{
    /**
     * @param GetLocationItemsResult[] $items
     */
    public function transform(array $items): QueryResult
    {
        return new QueryCollectionResult(
            items: $items,
            pageNumber: 1,
            pageSize: count(value: $items),
            total: count(value: $items),
        );
    }
}
