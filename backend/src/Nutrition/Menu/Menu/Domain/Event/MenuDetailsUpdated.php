<?php

namespace Nutrition\Menu\Menu\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class MenuDetailsUpdated extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $items
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
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
        return 'golifecraft.nutrition.event.1.menu.details_updated';
    }
}
