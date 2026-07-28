<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel;

interface GetMenusNeedleDataQuery
{
    public function findMenus(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $filterType = null,
        ?string $orderBy = null,
    ): array;

    public function totalMenus(
        ?string $filterName = null,
        ?string $filterType = null,
    ): int;
}
