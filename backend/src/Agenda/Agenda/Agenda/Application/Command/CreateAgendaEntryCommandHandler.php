<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateAgendaEntryCommandHandler
{
    public function __construct(
        private AgendaEntryRepository $agendaEntryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateAgendaEntryCommand $command): void
    {
        $agendaEntry = AgendaEntry::create(
            id: $this->agendaEntryRepository->nextId(),
            entryDate: $command->entryDate,
            time: $command->time,
            title: $command->title,
            kind: $command->kind,
            category: $command->category,
            notes: $command->notes,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->agendaEntryRepository->save(agendaEntry: $agendaEntry);
        $this->domainEventCollectorService->register(aggregate: $agendaEntry);
    }
}
