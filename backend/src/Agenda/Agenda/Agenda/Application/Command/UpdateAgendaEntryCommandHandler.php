<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Domain\Exception\UpdateAgendaEntryException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateAgendaEntryCommandHandler
{
    public function __construct(
        private AgendaEntryRepository $agendaEntryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateAgendaEntryCommand $command): void
    {
        $agendaEntry = $this->agendaEntryRepository->findById(id: $command->agendaEntryId);

        if (null === $agendaEntry) {
            throw UpdateAgendaEntryException::notFound(agendaEntryId: $command->agendaEntryId);
        }

        $agendaEntry->update(
            entryDate: $command->entryDate,
            time: $command->time,
            title: $command->title,
            kind: $command->kind,
            category: $command->category,
            notes: $command->notes,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->agendaEntryRepository->save(agendaEntry: $agendaEntry);
        $this->domainEventCollectorService->register(aggregate: $agendaEntry);
    }
}
