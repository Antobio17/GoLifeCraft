<?php

namespace Nutrition\Pantry\Location\Domain\QueryModel;

use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationItemsResult;

interface GetLocationItemsNeedleDataQuery
{
    public function locationExists(string $locationId): bool;

    /**
     * @return GetLocationItemsResult[]
     */
    public function findItems(string $locationId): array;
}
