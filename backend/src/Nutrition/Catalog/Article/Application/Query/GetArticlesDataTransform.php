<?php

namespace Nutrition\Catalog\Article\Application\Query;

use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticlesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetArticlesDataTransform
{
    /**
     * @param GetArticlesResult[] $articles
     */
    public function transform(
        array $articles,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
