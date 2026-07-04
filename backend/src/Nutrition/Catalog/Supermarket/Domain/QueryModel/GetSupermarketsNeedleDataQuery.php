<?php

namespace Nutrition\Catalog\Supermarket\Domain\QueryModel;

interface GetSupermarketsNeedleDataQuery
{
    public function findSupermarkets(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $orderBy = null,
    ): array;

    public function totalSupermarkets(
        ?string $filterName = null,
    ): int;
}
