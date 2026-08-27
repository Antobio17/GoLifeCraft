<?php

namespace Nutrition\Kitchen\Production\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ProductionCooked extends DomainEvent
{
    /**
     * Consumed articles travel already flattened and scaled to the servings actually cooked, in
     * each article's base unit, so no subscriber has to resolve the recipe again.
     *
     * @param array<int, array{articleId: string, quantity: float, unit: string}> $consumedArticles
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $recipeId,
        public string $cookDate,
        public string $status,
        public float $servingsCooked,
        public string $nameSnapshot,
        public string $emojiSnapshot,
        public array $consumedArticles,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.production.cooked';
    }
}
