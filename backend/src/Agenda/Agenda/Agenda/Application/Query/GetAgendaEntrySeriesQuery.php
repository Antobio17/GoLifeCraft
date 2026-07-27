<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetAgendaEntrySeriesQuery implements Query
{
    public function __construct(
        public string $seriesId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.agenda.query.1.agenda_entry_series.get';
    }
}
