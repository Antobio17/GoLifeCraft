<?php

namespace Nutrition\Pantry\Location\Domain\QueryModel;

use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationsResult;

interface GetLocationsNeedleDataQuery
{
    /**
     * @return GetLocationsResult[]
     */
    public function findLocations(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $orderBy = null,
    ): array;

    public function totalLocations(?string $filterName = null): int;
}
