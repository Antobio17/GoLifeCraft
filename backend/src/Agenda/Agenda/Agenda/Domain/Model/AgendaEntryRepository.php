<?php

namespace Agenda\Agenda\Agenda\Domain\Model;

interface AgendaEntryRepository
{
    public function nextId(): string;

    public function findById(string $id): ?AgendaEntry;

    public function save(AgendaEntry $agendaEntry): void;

    public function delete(AgendaEntry $agendaEntry): void;
}
