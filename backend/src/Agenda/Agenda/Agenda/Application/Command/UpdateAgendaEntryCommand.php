<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateAgendaEntryCommand implements Command
{
    public function __construct(
        public string $agendaEntryId,
        public string $entryDate,
        public ?string $time,
        public string $title,
        public string $kind,
        public string $category,
        public string $notes,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.agenda.command.1.agenda_entry.update';
    }
}
