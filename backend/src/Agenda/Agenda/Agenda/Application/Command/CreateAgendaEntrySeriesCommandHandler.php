<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateAgendaEntrySeriesCommandHandler
{
    public function __construct(
        private AgendaEntryRepository $agendaEntryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateAgendaEntrySeriesCommand $command): void
    {
        $dates = AgendaEntry::seriesDates(
            entryDate: $command->entryDate,
            endDate: $command->endDate,
        );

        $seriesId = count(value: $dates) > 1 ? $this->agendaEntryRepository->nextId() : null;

        foreach ($dates as $date) {
            $agendaEntry = AgendaEntry::create(
                id: $this->agendaEntryRepository->nextId(),
                entryDate: $date,
                time: null,
                title: $command->title,
                kind: $command->kind,
                category: $command->category,
                notes: $command->notes,
                seriesId: $seriesId,
                createdByUserId: $command->createdByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->agendaEntryRepository->save(agendaEntry: $agendaEntry);
            $this->domainEventCollectorService->register(aggregate: $agendaEntry);
        }
    }
}
