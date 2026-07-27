<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaUpcomingResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetAgendaUpcomingDataTransform
{
    public function transform(GetAgendaUpcomingResult $upcoming): QueryResult;
}
