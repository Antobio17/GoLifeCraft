<?php

namespace Nutrition\Menu\Menu\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class MenuItemRemoved extends DomainEvent
{
    /**
     * @param array<int, array{meal: string, kind: string, refId: string, quantity: float, unit: ?string}> $items
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $menuItemId,
        public string $name,
        public string $emoji,
        public string $note,
        public string $type,
        public string $weekDays,
        public array $items,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.menu.item_removed';
    }
}
