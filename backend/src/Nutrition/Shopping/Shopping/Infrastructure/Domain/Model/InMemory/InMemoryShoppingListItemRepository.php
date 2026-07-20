<?php

namespace Nutrition\Shopping\Shopping\Infrastructure\Domain\Model\InMemory;

use Nutrition\Shopping\Shopping\Domain\Model\ShoppingListItem;
use Nutrition\Shopping\Shopping\Domain\Model\ShoppingListItemRepository;

final class InMemoryShoppingListItemRepository implements ShoppingListItemRepository
{
    /** @var array<int, ShoppingListItem> */
    private array $items = [];

    public function nextId(): string
    {
        return 'shopping-list-item-'.(count(value: $this->items) + 1);
    }

    public function findById(string $id): ?ShoppingListItem
    {
        foreach ($this->items as $item) {
            if ($item->id === $id) {
                return $item;
            }
        }

        return null;
    }

    public function save(ShoppingListItem $shoppingListItem): void
    {
        foreach ($this->items as $key => $existing) {
            if ($existing->id === $shoppingListItem->id) {
                $this->items[$key] = $shoppingListItem;

                return;
            }
        }

        $this->items[] = $shoppingListItem;
    }

    public function delete(ShoppingListItem $shoppingListItem): void
    {
        foreach ($this->items as $key => $existing) {
            if ($existing->id === $shoppingListItem->id) {
                unset($this->items[$key]);
                break;
            }
        }
    }
}
