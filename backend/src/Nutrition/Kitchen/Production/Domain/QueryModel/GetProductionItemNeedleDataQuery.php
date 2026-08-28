<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionItemResult;

interface GetProductionItemNeedleDataQuery
{
    public function findItemById(string $productionId, string $itemId): ?GetProductionItemResult;
}
