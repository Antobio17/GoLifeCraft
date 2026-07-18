<?php

namespace Nutrition\GlobalCatalog\Article\Application\Query;

use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticlesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetGlobalArticlesDataTransform
{
    /**
     * @param GetGlobalArticlesResult[] $globalArticles
     */
    public function transform(
        array $globalArticles,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
