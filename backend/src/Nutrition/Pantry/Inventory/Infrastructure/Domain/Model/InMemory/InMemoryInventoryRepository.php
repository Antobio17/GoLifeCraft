<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\Model\InMemory;

use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryRepository;

final class InMemoryInventoryRepository implements InventoryRepository
{
    /** @var Inventory[] */
    private array $inventories = [];

    private int $generatedIds = 0;

    public function nextId(): string
    {
        return 'inventory-'.(++$this->generatedIds);
    }

    public function findById(string $id): ?Inventory
    {
        foreach ($this->inventories as $inventory) {
            if ($inventory->id === $id) {
                return $inventory;
            }
        }

        return null;
    }

    public function save(Inventory $inventory): void
    {
        foreach ($this->inventories as $key => $existing) {
            if ($existing->id === $inventory->id) {
                $this->inventories[$key] = $inventory;

                return;
            }
        }

        $this->inventories[] = $inventory;
    }

    public function delete(Inventory $inventory): void
    {
        foreach ($this->inventories as $key => $existing) {
            if ($existing->id === $inventory->id) {
                unset($this->inventories[$key]);

                return;
            }
        }
    }
}
