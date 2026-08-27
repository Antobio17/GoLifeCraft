<?php

namespace Nutrition\Recipe\Recipe\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class RecipeCreated extends DomainEvent
{
    /**
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string, position: int}> $ingredients
     * @param array<int, array{position: int, text: string, minutes: ?int}>                                 $steps
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public string $emoji,
        public string $category,
        public int $servings,
        public array $ingredients,
        public array $steps,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.recipe.created';
    }
}
