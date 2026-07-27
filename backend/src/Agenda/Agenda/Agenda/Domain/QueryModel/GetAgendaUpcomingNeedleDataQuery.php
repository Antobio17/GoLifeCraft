<?php

namespace Agenda\Agenda\Agenda\Domain\QueryModel;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaUpcomingResult;

interface GetAgendaUpcomingNeedleDataQuery
{
    public function findUpcoming(string $fromDate, int $days): GetAgendaUpcomingResult;
}
