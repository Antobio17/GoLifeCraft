<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel;

interface GetArticlesNeedleDataQuery
{
    public function findArticles(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $orderBy = null,
    ): array;

    public function totalArticles(
        ?string $filterName = null,
    ): int;
}
