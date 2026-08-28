<?php

namespace Nutrition\Kitchen\Production\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ProductionItemCooked extends DomainEvent
{
    /**
     * Consumed articles travel already flattened and scaled to the servings actually cooked, in
     * each article's base unit, so no subscriber has to resolve the recipe again.
     *
     * @param array<int, array{articleId: string, quantity: float, unit: string}> $consumedArticles
     * @param array<int, array{recipeId: string, servings: float}>                $consumedRecipes
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $itemId,
        public string $recipeId,
        public string $fromDate,
        public string $toDate,
        public float $servingsPlanned,
        public float $servingsCooked,
        public string $nameSnapshot,
        public string $emojiSnapshot,
        public array $consumedArticles,
        public array $consumedRecipes,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.production.item_cooked';
    }
}
