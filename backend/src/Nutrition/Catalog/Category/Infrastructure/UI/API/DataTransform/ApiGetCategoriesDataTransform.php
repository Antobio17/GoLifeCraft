<?php

namespace Nutrition\Catalog\Category\Infrastructure\UI\API\DataTransform;

use Nutrition\Catalog\Category\Application\Query\GetCategoriesDataTransform;
use Nutrition\Catalog\Category\Domain\QueryModel\Dto\GetCategoriesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetCategoriesDataTransform implements GetCategoriesDataTransform
{
    /**
     * @param GetCategoriesResult[] $categories
     */
    public function transform(
        array $categories,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $categories,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
