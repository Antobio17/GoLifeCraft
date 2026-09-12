<?php

namespace Nutrition\Pantry\Movement\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class StockMovementRevoked extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $kind,
        public string $refId,
        public string $type,
        public \DateTime $effectiveAt,
        public float $quantity,
        public float $originalQuantity,
        public ?string $originalUnit,
        public string $sourceKind,
        public string $sourceId,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $revokedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.stock_movement.revoked';
    }
}
