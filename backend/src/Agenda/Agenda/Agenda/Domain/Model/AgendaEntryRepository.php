<?php

namespace Agenda\Agenda\Agenda\Domain\Model;

interface AgendaEntryRepository
{
    public function nextId(): string;

    public function findById(string $id): ?AgendaEntry;

    /**
     * @return array<int, AgendaEntry>
     */
    public function findBySeriesId(string $seriesId): array;

    public function save(AgendaEntry $agendaEntry): void;

    public function delete(AgendaEntry $agendaEntry): void;
}
