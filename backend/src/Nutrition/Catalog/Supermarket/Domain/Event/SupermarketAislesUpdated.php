<?php

namespace Nutrition\Catalog\Supermarket\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class SupermarketAislesUpdated extends DomainEvent
{
    /**
     * @param array<int, array{id: string, name: string, position: int}> $aisles
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public array $aisles,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.supermarket.aisles.updated';
    }
}
