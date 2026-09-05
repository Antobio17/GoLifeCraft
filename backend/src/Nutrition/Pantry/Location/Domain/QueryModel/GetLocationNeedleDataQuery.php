<?php

namespace Nutrition\Pantry\Location\Domain\QueryModel;

use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationResult;

interface GetLocationNeedleDataQuery
{
    public function findLocationById(string $locationId): ?GetLocationResult;
}
