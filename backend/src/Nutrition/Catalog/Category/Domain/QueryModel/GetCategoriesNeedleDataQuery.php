<?php

namespace Nutrition\Catalog\Category\Domain\QueryModel;

interface GetCategoriesNeedleDataQuery
{
    public function findCategories(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $orderBy = null,
    ): array;

    public function totalCategories(
        ?string $filterName = null,
    ): int;
}
