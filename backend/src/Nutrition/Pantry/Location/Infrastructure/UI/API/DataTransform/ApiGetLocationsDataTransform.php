<?php

namespace Nutrition\Pantry\Location\Infrastructure\UI\API\DataTransform;

use Nutrition\Pantry\Location\Application\Query\GetLocationsDataTransform;
use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetLocationsDataTransform implements GetLocationsDataTransform
{
    /**
     * @param GetLocationsResult[] $locations
     */
    public function transform(
        array $locations,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $locations,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
