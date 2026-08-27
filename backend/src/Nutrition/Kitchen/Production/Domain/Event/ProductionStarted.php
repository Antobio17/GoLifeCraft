<?php

namespace Nutrition\Kitchen\Production\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ProductionStarted extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $recipeId,
        public string $cookDate,
        public string $status,
        public float $servingsPlanned,
        public string $nameSnapshot,
        public string $emojiSnapshot,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.production.started';
    }
}
