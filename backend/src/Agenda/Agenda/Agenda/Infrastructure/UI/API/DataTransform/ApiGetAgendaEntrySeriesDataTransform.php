<?php

namespace Agenda\Agenda\Agenda\Infrastructure\UI\API\DataTransform;

use Agenda\Agenda\Agenda\Application\Query\GetAgendaEntrySeriesDataTransform;
use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaEntrySeriesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetAgendaEntrySeriesDataTransform implements GetAgendaEntrySeriesDataTransform
{
    public function transform(GetAgendaEntrySeriesResult $series): QueryResult
    {
        return new QuerySingleResult(item: $series);
    }
}
