<?php

namespace Nutrition\Pantry\Stock\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ArticleStockDeleted extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $articleId,
        public float $quantity,
        public ?string $locationId,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $deletedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.article_stock.deleted';
    }
}
