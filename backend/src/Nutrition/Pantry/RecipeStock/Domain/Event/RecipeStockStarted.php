<?php

namespace Nutrition\Pantry\RecipeStock\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class RecipeStockStarted extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $recipeId,
        public float $servings,
        public ?string $locationId,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.recipe_stock.started';
    }
}
