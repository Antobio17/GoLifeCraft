<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\DataTransform;

use Nutrition\Kitchen\Production\Application\Query\GetRecipeLotsDataTransform;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetRecipeLotsDataTransform implements GetRecipeLotsDataTransform
{
    public function transform(array $lots): QueryResult
    {
        return new QueryCollectionResult(
            items: $lots,
            pageNumber: 1,
            pageSize: count(value: $lots),
            total: count(value: $lots),
        );
    }
}
