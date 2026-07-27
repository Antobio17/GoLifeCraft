<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetAgendaUpcomingQuery implements Query
{
    public function __construct(
        public string $fromDate,
        public int $days,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.agenda.query.1.agenda.upcoming';
    }
}
