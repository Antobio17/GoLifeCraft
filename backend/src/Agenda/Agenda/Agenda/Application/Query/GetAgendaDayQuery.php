<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetAgendaDayQuery implements Query
{
    public function __construct(
        public string $date,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.agenda.query.1.agenda.day';
    }
}
