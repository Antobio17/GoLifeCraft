<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Domain\Exception\DeleteAgendaEntrySeriesException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteAgendaEntrySeriesCommandHandler
{
    public function __construct(
        private AgendaEntryRepository $agendaEntryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteAgendaEntrySeriesCommand $command): void
    {
        if ('' === $command->seriesId) {
            throw DeleteAgendaEntrySeriesException::notFound(seriesId: $command->seriesId);
        }

        $agendaEntries = $this->agendaEntryRepository->findBySeriesId(seriesId: $command->seriesId);

        if ([] === $agendaEntries) {
            throw DeleteAgendaEntrySeriesException::notFound(seriesId: $command->seriesId);
        }

        foreach ($agendaEntries as $agendaEntry) {
            $agendaEntry->delete(
                deletedByUserId: $command->deletedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->agendaEntryRepository->delete(agendaEntry: $agendaEntry);
            $this->domainEventCollectorService->register(aggregate: $agendaEntry);
        }
    }
}
