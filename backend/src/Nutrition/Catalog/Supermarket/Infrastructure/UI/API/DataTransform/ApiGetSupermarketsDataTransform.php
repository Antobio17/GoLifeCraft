<?php

namespace Nutrition\Catalog\Supermarket\Infrastructure\UI\API\DataTransform;

use Nutrition\Catalog\Supermarket\Application\Query\GetSupermarketsDataTransform;
use Nutrition\Catalog\Supermarket\Domain\QueryModel\Dto\GetSupermarketsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetSupermarketsDataTransform implements GetSupermarketsDataTransform
{
    /**
     * @param GetSupermarketsResult[] $supermarkets
     */
    public function transform(
        array $supermarkets,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $supermarkets,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
