<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ChangeAgendaEntryStatusCommand implements Command
{
    public function __construct(
        public string $agendaEntryId,
        public bool $done,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.agenda.command.1.agenda_entry.change_status';
    }
}
