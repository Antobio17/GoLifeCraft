<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DeleteAgendaEntryCommand implements Command
{
    public function __construct(
        public string $agendaEntryId,
        public string $deletedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.agenda.command.1.agenda_entry.delete';
    }
}
