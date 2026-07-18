<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\UI\API\DataTransform;

use Nutrition\GlobalCatalog\Article\Application\Query\GetGlobalArticlesDataTransform;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticlesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetGlobalArticlesDataTransform implements GetGlobalArticlesDataTransform
{
    /**
     * @param GetGlobalArticlesResult[] $globalArticles
     */
    public function transform(
        array $globalArticles,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $globalArticles,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
