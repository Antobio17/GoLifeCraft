<?php

namespace Nutrition\Shopping\Shopping\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ShoppingListItemRemoved extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $articleId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.shopping_list_item.removed';
    }
}
