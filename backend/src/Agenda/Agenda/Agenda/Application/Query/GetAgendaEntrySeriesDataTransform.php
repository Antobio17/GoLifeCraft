<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaEntrySeriesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetAgendaEntrySeriesDataTransform
{
    public function transform(GetAgendaEntrySeriesResult $series): QueryResult;
}
