<?php

namespace App\Tests\Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocation;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class InventoryTestPantry
{
    public const string INVENTORY_ID = 'inventory-1';

    /**
     * @param array<int, array{0: string, 1: string, 2: string, 3: string, 4: float}> $items
     */
    public static function location(
        int $position,
        string $locationId,
        string $name,
        array $items,
        DateTimeGenerator $dateTimeGenerator,
    ): InventoryLocation {
        $location = InventoryLocation::plan(
            inventoryId: self::INVENTORY_ID,
            position: $position,
            locationId: $locationId,
            nameSnapshot: $name,
            emojiSnapshot: '🥶',
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $dateTimeGenerator,
        );

        $itemPosition = 0;

        foreach ($items as [$refId, $kind, $itemName, $unit, $quantity]) {
            ++$itemPosition;

            $location->items[] = InventoryLocationItem::plan(
                inventoryId: self::INVENTORY_ID,
                inventoryLocationId: $location->id,
                position: $itemPosition,
                kind: $kind,
                refId: $refId,
                nameSnapshot: $itemName,
                emojiSnapshot: '🍚',
                unit: $unit,
                expectedQuantity: $quantity,
                createdByUserId: 'god-user-id',
                dateTimeGenerator: $dateTimeGenerator,
            );
        }

        return $location;
    }
}
