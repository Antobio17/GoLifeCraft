<?php

namespace Nutrition\Recipe\Recipe\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class RecipeImageAssigned extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public string $emoji,
        public ?string $image,
        public \DateTime $updatedAt,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.recipe.image_assigned';
    }
}
