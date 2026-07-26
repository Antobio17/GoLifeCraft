<?php

namespace Agenda\Agenda\Agenda\Domain\QueryModel;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaCalendarResult;

interface GetAgendaCalendarNeedleDataQuery
{
    public function findMonthCounts(string $month): GetAgendaCalendarResult;
}
