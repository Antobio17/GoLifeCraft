<?php

namespace Nutrition\Kitchen\Production\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ProductionDiscarded extends DomainEvent
{
    /**
     * @param array<int, array{itemId: string, recipeId: string, position: int, status: string, servingsPlanned: float, servingsCooked: float, nameSnapshot: string, emojiSnapshot: string}> $items
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $fromDate,
        public string $toDate,
        public string $status,
        public array $items,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $discardedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.production.discarded';
    }
}
