<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetAgendaCalendarQuery implements Query
{
    public function __construct(
        public string $month,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.agenda.query.1.agenda.calendar';
    }
}
