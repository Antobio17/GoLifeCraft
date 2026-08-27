<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\DataTransform;

use Nutrition\Kitchen\Production\Application\Query\GetProductionDataTransform;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetProductionDataTransform implements GetProductionDataTransform
{
    public function transform(GetProductionResult $production): QueryResult
    {
        return new QuerySingleResult(item: $production);
    }
}
