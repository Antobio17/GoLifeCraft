<?php

namespace Nutrition\Pantry\Stock\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ArticleStockChanged extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $articleId,
        public float $previousQuantity,
        public float $quantity,
        public string $trackingMode,
        public float $confidence,
        public ?float $uncertainty,
        public ?float $minQuantity,
        public ?float $maxQuantity,
        public string $level,
        public ?float $referenceQuantity,
        public ?\DateTime $observedAt,
        public ?float $observedQuantity,
        public int $inferredCount,
        public float $inferredFlow,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.article_stock.changed';
    }
}
