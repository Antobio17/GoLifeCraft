<?php

namespace Nutrition\Pantry\Location\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class LocationItemAssigned extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $items
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $itemId,
        public string $kind,
        public string $refId,
        public ?string $previousLocationId,
        public string $name,
        public string $emoji,
        public string $description,
        public array $items,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.pantry_location.item_assigned';
    }
}
