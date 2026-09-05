<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel;

use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryLocationPlan;

interface StartInventoryNeedleDataQuery
{
    public function openInventoryId(): ?string;

    /**
     * @return InventoryLocationPlan[]
     */
    public function findLocationPlans(): array;
}
