<?php

namespace Agenda\Agenda\Agenda\Infrastructure\Domain\Model\InMemory;

use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntryRepository;

final class InMemoryAgendaEntryRepository implements AgendaEntryRepository
{
    /** @var array<int, AgendaEntry> */
    private array $entries = [];

    private int $generatedIds = 0;

    public function nextId(): string
    {
        return 'agenda-entry-'.(++$this->generatedIds);
    }

    public function findById(string $id): ?AgendaEntry
    {
        foreach ($this->entries as $entry) {
            if ($entry->id === $id) {
                return $entry;
            }
        }

        return null;
    }

    public function findBySeriesId(string $seriesId): array
    {
        $found = [];

        foreach ($this->entries as $entry) {
            if ($entry->seriesId === $seriesId) {
                $found[] = $entry;
            }
        }

        return $found;
    }

    public function save(AgendaEntry $agendaEntry): void
    {
        foreach ($this->entries as $key => $existing) {
            if ($existing->id === $agendaEntry->id) {
                $this->entries[$key] = $agendaEntry;

                return;
            }
        }

        $this->entries[] = $agendaEntry;
    }

    public function delete(AgendaEntry $agendaEntry): void
    {
        foreach ($this->entries as $key => $existing) {
            if ($existing->id === $agendaEntry->id) {
                unset($this->entries[$key]);
                break;
            }
        }
    }
}
