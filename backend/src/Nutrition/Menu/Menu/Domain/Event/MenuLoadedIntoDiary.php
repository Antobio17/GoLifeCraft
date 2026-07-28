<?php

namespace Nutrition\Menu\Menu\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class MenuLoadedIntoDiary extends DomainEvent
{
    /**
     * @param array<int, array{date: string, items: array<int, array{meal: string, kind: string, refId: string, quantity: float, unit: ?string}>}> $plannedDays
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public string $emoji,
        public string $type,
        public ?string $dayKey,
        public array $plannedDays,
        public string $loadedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.menu.loaded';
    }
}
