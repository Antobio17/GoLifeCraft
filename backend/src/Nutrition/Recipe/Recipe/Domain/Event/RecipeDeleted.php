<?php

namespace Nutrition\Recipe\Recipe\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class RecipeDeleted extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.recipe.deleted';
    }
}
