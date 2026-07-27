<?php

namespace Agenda\Agenda\Agenda\Infrastructure\UI\API\DataTransform;

use Agenda\Agenda\Agenda\Application\Query\GetAgendaUpcomingDataTransform;
use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaUpcomingResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetAgendaUpcomingDataTransform implements GetAgendaUpcomingDataTransform
{
    public function transform(GetAgendaUpcomingResult $upcoming): QueryResult
    {
        return new QuerySingleResult(item: $upcoming);
    }
}
