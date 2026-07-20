<?php

namespace Nutrition\Shopping\Shopping\Domain\Model;

interface ShoppingListItemRepository
{
    public function nextId(): string;

    public function findById(string $id): ?ShoppingListItem;

    public function save(ShoppingListItem $shoppingListItem): void;

    public function delete(ShoppingListItem $shoppingListItem): void;
}
