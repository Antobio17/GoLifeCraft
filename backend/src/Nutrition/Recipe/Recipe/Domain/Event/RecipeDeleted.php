<?php

namespace Nutrition\Recipe\Recipe\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class RecipeDeleted extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $ingredients
     * @param array<int, array<string, mixed>> $steps
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public string $emoji,
        public ?string $image,
        public string $category,
        public int $servings,
        public array $ingredients,
        public array $steps,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $deletedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.recipe.deleted';
    }
}
