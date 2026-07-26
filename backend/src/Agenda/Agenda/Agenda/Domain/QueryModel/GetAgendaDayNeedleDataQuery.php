<?php

namespace Agenda\Agenda\Agenda\Domain\QueryModel;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaDayResult;

interface GetAgendaDayNeedleDataQuery
{
    public function findDay(string $date): GetAgendaDayResult;
}
