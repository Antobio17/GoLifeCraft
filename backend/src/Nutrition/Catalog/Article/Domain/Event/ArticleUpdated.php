<?php

namespace Nutrition\Catalog\Article\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ArticleUpdated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public ?string $emoji,
        public float $referenceAmount,
        public ?float $calories,
        public ?float $protein,
        public ?float $fat,
        public ?float $carbs,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.article.updated';
    }
}
