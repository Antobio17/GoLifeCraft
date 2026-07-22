<?php

namespace Nutrition\GlobalCatalog\Article\Domain\QueryModel;

interface GetGlobalArticlesNeedleDataQuery
{
    public function findGlobalArticles(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $filterSource = null,
        ?string $orderBy = null,
    ): array;

    public function totalGlobalArticles(
        ?string $filterName = null,
        ?string $filterSource = null,
    ): int;
}
