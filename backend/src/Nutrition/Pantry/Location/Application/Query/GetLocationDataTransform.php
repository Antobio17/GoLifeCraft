<?php

namespace Nutrition\Pantry\Location\Application\Query;

use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetLocationDataTransform
{
    public function transform(GetLocationResult $location): QueryResult;
}
