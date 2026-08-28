<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\DataTransform;

use Nutrition\Kitchen\Production\Application\Query\GetProductionItemDataTransform;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionItemResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetProductionItemDataTransform implements GetProductionItemDataTransform
{
    public function transform(GetProductionItemResult $item): QueryResult
    {
        return new QuerySingleResult(item: $item);
    }
}
