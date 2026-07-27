<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DeleteAgendaEntrySeriesCommand implements Command
{
    public function __construct(
        public string $seriesId,
        public string $deletedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.agenda.command.1.agenda_entry.delete_series';
    }
}
