<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Inventory\Domain\QueryModel\ReopenInventoryNeedleDataQuery;

final class InMemoryReopenInventoryNeedleDataQuery implements ReopenInventoryNeedleDataQuery
{
    private ?string $openInventoryId = null;

    public function withOpenInventory(string $inventoryId): void
    {
        $this->openInventoryId = $inventoryId;
    }

    public function openInventoryId(): ?string
    {
        return $this->openInventoryId;
    }
}
