<?php

namespace Agenda\Agenda\Agenda\Domain\QueryModel;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaEntrySeriesResult;

interface GetAgendaEntrySeriesNeedleDataQuery
{
    public function findSeriesById(string $seriesId): ?GetAgendaEntrySeriesResult;
}
