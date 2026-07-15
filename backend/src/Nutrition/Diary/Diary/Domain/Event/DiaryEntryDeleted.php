<?php

namespace Nutrition\Diary\Diary\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class DiaryEntryDeleted extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.diary_entry.deleted';
    }
}
