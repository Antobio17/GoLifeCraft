<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel;

interface CountInventoryItemNeedleDataQuery
{
    /**
     * How many base units ("g"/"ml") one of the given alias is worth for that article,
     * or null when the alias is not configured.
     */
    public function baseUnitFactor(string $articleId, string $unit): ?float;
}
