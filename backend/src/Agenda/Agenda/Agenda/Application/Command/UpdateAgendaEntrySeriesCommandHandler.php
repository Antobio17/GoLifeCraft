<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Domain\Exception\AgendaEntrySeriesException;
use Agenda\Agenda\Agenda\Domain\Exception\UpdateAgendaEntrySeriesException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateAgendaEntrySeriesCommandHandler
{
    public function __construct(
        private AgendaEntryRepository $agendaEntryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateAgendaEntrySeriesCommand $command): void
    {
        if ('' === $command->seriesId) {
            throw UpdateAgendaEntrySeriesException::notFound(seriesId: $command->seriesId);
        }

        $dates = AgendaEntry::seriesDates(
            entryDate: $command->entryDate,
            endDate: $command->endDate,
        );

        if (count(value: $dates) < 2) {
            throw AgendaEntrySeriesException::rangeMustCoverSeveralDays(
                entryDate: $command->entryDate,
                endDate: $command->endDate,
            );
        }

        $currentEntries = $this->agendaEntryRepository->findBySeriesId(seriesId: $command->seriesId);

        if ([] === $currentEntries) {
            throw UpdateAgendaEntrySeriesException::notFound(seriesId: $command->seriesId);
        }

        $entriesByDate = [];
        foreach ($currentEntries as $entry) {
            $entriesByDate[$entry->entryDate] = $entry;
        }

        foreach ($dates as $date) {
            if (isset($entriesByDate[$date])) {
                $this->updateEntry(entry: $entriesByDate[$date], command: $command);

                continue;
            }

            $this->createEntry(entryDate: $date, command: $command);
        }

        foreach ($entriesByDate as $entryDate => $entry) {
            if (in_array(needle: $entryDate, haystack: $dates, strict: true)) {
                continue;
            }

            $this->deleteEntry(entry: $entry, command: $command);
        }
    }

    private function updateEntry(AgendaEntry $entry, UpdateAgendaEntrySeriesCommand $command): void
    {
        $entry->update(
            entryDate: $entry->entryDate,
            time: null,
            title: $command->title,
            kind: $command->kind,
            category: $command->category,
            notes: $command->notes,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->agendaEntryRepository->save(agendaEntry: $entry);
        $this->domainEventCollectorService->register(aggregate: $entry);
    }

    private function createEntry(string $entryDate, UpdateAgendaEntrySeriesCommand $command): void
    {
        $entry = AgendaEntry::create(
            id: $this->agendaEntryRepository->nextId(),
            entryDate: $entryDate,
            time: null,
            title: $command->title,
            kind: $command->kind,
            category: $command->category,
            notes: $command->notes,
            seriesId: $command->seriesId,
            createdByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->agendaEntryRepository->save(agendaEntry: $entry);
        $this->domainEventCollectorService->register(aggregate: $entry);
    }

    private function deleteEntry(AgendaEntry $entry, UpdateAgendaEntrySeriesCommand $command): void
    {
        $entry->delete(
            deletedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->agendaEntryRepository->delete(agendaEntry: $entry);
        $this->domainEventCollectorService->register(aggregate: $entry);
    }
}
