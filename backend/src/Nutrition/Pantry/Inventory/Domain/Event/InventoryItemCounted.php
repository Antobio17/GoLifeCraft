<?php

namespace Nutrition\Pantry\Inventory\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class InventoryItemCounted extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $itemId,
        public int $itemPosition,
        public string $kind,
        public string $refId,
        public string $nameSnapshot,
        public string $emojiSnapshot,
        public string $unit,
        public float $expectedQuantity,
        public ?float $countedQuantity,
        public ?string $countedUnit,
        public string $inventoryLocationId,
        public int $locationPosition,
        public string $locationId,
        public string $locationNameSnapshot,
        public string $locationEmojiSnapshot,
        public string $countedOn,
        public string $shift,
        public string $status,
        public string $note,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.inventory.item_counted';
    }
}
