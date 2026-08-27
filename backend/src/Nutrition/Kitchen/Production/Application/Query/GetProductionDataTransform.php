<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetProductionDataTransform
{
    public function transform(GetProductionResult $production): QueryResult;
}
