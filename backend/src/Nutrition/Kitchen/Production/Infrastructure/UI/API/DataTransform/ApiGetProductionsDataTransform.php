<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\DataTransform;

use Nutrition\Kitchen\Production\Application\Query\GetProductionsDataTransform;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetProductionsDataTransform implements GetProductionsDataTransform
{
    /**
     * @param GetProductionsResult[] $productions
     */
    public function transform(
        array $productions,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $productions,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
