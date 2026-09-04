<?php

namespace Nutrition\Shopping\Shopping\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ShoppingListItemAdded extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public ?string $articleId,
        public ?string $customName,
        public int $quantity,
        public ?float $baseQuantity,
        public bool $checked,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.shopping_list_item.added';
    }
}
