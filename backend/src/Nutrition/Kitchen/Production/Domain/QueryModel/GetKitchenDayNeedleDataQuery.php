<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetKitchenDayResult;

interface GetKitchenDayNeedleDataQuery
{
    public function findKitchenDay(string $date): GetKitchenDayResult;
}
