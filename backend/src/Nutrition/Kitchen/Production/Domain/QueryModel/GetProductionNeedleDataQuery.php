<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionResult;

interface GetProductionNeedleDataQuery
{
    public function findProductionById(string $productionId): ?GetProductionResult;
}
