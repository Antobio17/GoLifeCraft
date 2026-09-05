<?php

namespace Nutrition\Pantry\Location\Infrastructure\UI\API\DataTransform;

use Nutrition\Pantry\Location\Application\Query\GetLocationDataTransform;
use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetLocationDataTransform implements GetLocationDataTransform
{
    public function transform(GetLocationResult $location): QueryResult
    {
        return new QuerySingleResult(item: $location);
    }
}
