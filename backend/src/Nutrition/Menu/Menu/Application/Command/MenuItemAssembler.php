<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class MenuItemAssembler
{
    public function __construct(
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    /**
     * Rewriting a menu reuses the items it already had: their id is what the breakdown hangs from.
     *
     * @param MenuItemData[] $items
     * @param MenuItem[]     $existingItems
     *
     * @return MenuItem[]
     */
    public function assemble(string $menuId, array $items, string $userId, array $existingItems = []): array
    {
        $existing = [];
        foreach ($existingItems as $existingItem) {
            $existing[$existingItem->id] = $existingItem;
        }

        return array_map(
            callback: fn (MenuItemData $itemData): MenuItem => $this->assembleItem(
                menuId: $menuId,
                itemData: $itemData,
                existing: $existing,
                userId: $userId,
            ),
            array: $items,
        );
    }

    /**
     * @param array<string, MenuItem> $existing
     */
    private function assembleItem(string $menuId, MenuItemData $itemData, array $existing, string $userId): MenuItem
    {
        $item = null !== $itemData->id ? ($existing[$itemData->id] ?? null) : null;

        if (null === $item || $item->kind !== $itemData->kind || $item->refId !== $itemData->refId) {
            return MenuItem::create(
                menuId: $menuId,
                dayKey: $itemData->dayKey,
                meal: $itemData->meal,
                kind: $itemData->kind,
                refId: $itemData->refId,
                quantity: $itemData->quantity,
                unit: $itemData->unit,
                position: $itemData->position,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );
        }

        $item->reassign(
            dayKey: $itemData->dayKey,
            meal: $itemData->meal,
            quantity: $itemData->quantity,
            unit: $itemData->unit,
            position: $itemData->position,
            updatedByUserId: $userId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        return $item;
    }
}
