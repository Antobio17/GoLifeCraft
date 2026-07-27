<?php

namespace Agenda\Agenda\Agenda\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateAgendaEntrySeriesCommand implements Command
{
    public function __construct(
        public string $seriesId,
        public string $entryDate,
        public string $endDate,
        public string $title,
        public string $kind,
        public string $category,
        public string $notes,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.agenda.command.1.agenda_entry.update_series';
    }
}
