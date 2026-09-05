<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel;

use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryStockLine;

interface StartInventoryNeedleDataQuery
{
    public function openInventoryId(): ?string;

    public function locationExists(string $locationId): bool;

    /**
     * @return InventoryStockLine[]
     */
    public function findStockLines(?string $locationId): array;
}
