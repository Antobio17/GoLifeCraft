<?php

namespace Nutrition\Pantry\Inventory\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class InventoryLocation extends GenericAggregate
{
    public string $inventoryId;
    public int $position;
    public string $locationId;
    public string $nameSnapshot;
    public string $emojiSnapshot;

    /** @var InventoryLocationItem[] */
    public array $items = [];

    public static function plan(
        string $inventoryId,
        int $position,
        string $locationId,
        string $nameSnapshot,
        string $emojiSnapshot,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $location = new self();
        $location->id = Uuid::uuid4()->toString();
        $location->inventoryId = $inventoryId;
        $location->position = $position;
        $location->locationId = $locationId;
        $location->nameSnapshot = $nameSnapshot;
        $location->emojiSnapshot = $emojiSnapshot;
        $location->stampCreation(userId: $createdByUserId, now: $now);

        return $location;
    }

    public function item(string $itemId): ?InventoryLocationItem
    {
        foreach ($this->items as $item) {
            if ($item->id === $itemId) {
                return $item;
            }
        }

        return null;
    }

    public function hasCountedItems(): bool
    {
        foreach ($this->items as $item) {
            if ($item->isCounted()) {
                return true;
            }
        }

        return false;
    }
}
