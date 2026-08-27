<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetKitchenDayResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetKitchenDayDataTransform
{
    public function transform(GetKitchenDayResult $kitchenDay): QueryResult;
}
