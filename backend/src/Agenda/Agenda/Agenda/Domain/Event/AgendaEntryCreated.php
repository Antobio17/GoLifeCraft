<?php

namespace Agenda\Agenda\Agenda\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class AgendaEntryCreated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $entryDate,
        public ?string $time,
        public string $title,
        public string $kind,
        public string $category,
        public string $notes,
        public bool $done,
        public ?string $seriesId,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.agenda.event.1.agenda_entry.created';
    }
}
