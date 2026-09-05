<?php

namespace Nutrition\Pantry\Inventory\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class InventoryValidated extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $lines
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $countedOn,
        public string $shift,
        public string $status,
        public ?string $locationId,
        public string $note,
        public array $lines,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.inventory.validated';
    }
}
