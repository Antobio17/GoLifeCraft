<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel;

interface CountInventoryItemNeedleDataQuery
{
    public function baseUnitFactor(string $articleId, string $unit): ?float;
}
