<?php

namespace Nutrition\Pantry\Location\Application\Query;

use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationItemsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetLocationItemsDataTransform
{
    /**
     * @param GetLocationItemsResult[] $items
     */
    public function transform(array $items): QueryResult;
}
