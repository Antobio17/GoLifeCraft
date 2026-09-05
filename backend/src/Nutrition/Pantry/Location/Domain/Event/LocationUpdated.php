<?php

namespace Nutrition\Pantry\Location\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class LocationUpdated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public string $emoji,
        public string $description,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.pantry_location.updated';
    }
}
