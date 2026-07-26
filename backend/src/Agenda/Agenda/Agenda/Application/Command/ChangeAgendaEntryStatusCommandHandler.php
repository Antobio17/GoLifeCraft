<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Domain\Exception\UpdateAgendaEntryException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ChangeAgendaEntryStatusCommandHandler
{
    public function __construct(
        private AgendaEntryRepository $agendaEntryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ChangeAgendaEntryStatusCommand $command): void
    {
        $agendaEntry = $this->agendaEntryRepository->findById(id: $command->agendaEntryId);

        if (null === $agendaEntry) {
            throw UpdateAgendaEntryException::notFound(agendaEntryId: $command->agendaEntryId);
        }

        $agendaEntry->changeStatus(
            done: $command->done,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->agendaEntryRepository->save(agendaEntry: $agendaEntry);
        $this->domainEventCollectorService->register(aggregate: $agendaEntry);
    }
}
