<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Domain\Exception\DeleteAgendaEntryException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteAgendaEntryCommandHandler
{
    public function __construct(
        private AgendaEntryRepository $agendaEntryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteAgendaEntryCommand $command): void
    {
        $agendaEntry = $this->agendaEntryRepository->findById(id: $command->agendaEntryId);

        if (null === $agendaEntry) {
            throw DeleteAgendaEntryException::notFound(agendaEntryId: $command->agendaEntryId);
        }

        $agendaEntry->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->agendaEntryRepository->delete(agendaEntry: $agendaEntry);
        $this->domainEventCollectorService->register(aggregate: $agendaEntry);
    }
}
