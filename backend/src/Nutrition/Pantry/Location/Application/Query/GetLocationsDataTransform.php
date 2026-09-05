<?php

namespace Nutrition\Pantry\Location\Application\Query;

use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetLocationsDataTransform
{
    /**
     * @param GetLocationsResult[] $locations
     */
    public function transform(
        array $locations,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
