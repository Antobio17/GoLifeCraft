<?php

namespace Nutrition\Pantry\Inventory\Domain\Model;

interface InventoryRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Inventory;

    public function findByIdWithItem(string $id, string $itemId): ?Inventory;

    public function save(Inventory $inventory): void;

    public function delete(Inventory $inventory): void;
}
