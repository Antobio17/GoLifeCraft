<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaCalendarResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetAgendaCalendarDataTransform
{
    public function transform(GetAgendaCalendarResult $calendar): QueryResult;
}
