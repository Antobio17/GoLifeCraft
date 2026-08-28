<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionItemResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetProductionItemDataTransform
{
    public function transform(GetProductionItemResult $item): QueryResult;
}
