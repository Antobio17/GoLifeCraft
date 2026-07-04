<?php

namespace Nutrition\Catalog\Article\Infrastructure\UI\API\DataTransform;

use Nutrition\Catalog\Article\Application\Query\GetArticlesDataTransform;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticlesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetArticlesDataTransform implements GetArticlesDataTransform
{
    /**
     * @param GetArticlesResult[] $articles
     */
    public function transform(
        array $articles,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $articles,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
