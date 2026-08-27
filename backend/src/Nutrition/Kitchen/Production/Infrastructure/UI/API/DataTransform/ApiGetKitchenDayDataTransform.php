<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\DataTransform;

use Nutrition\Kitchen\Production\Application\Query\GetKitchenDayDataTransform;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetKitchenDayResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetKitchenDayDataTransform implements GetKitchenDayDataTransform
{
    public function transform(GetKitchenDayResult $kitchenDay): QueryResult
    {
        return new QuerySingleResult(item: $kitchenDay);
    }
}
