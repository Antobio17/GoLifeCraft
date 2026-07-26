<?php

namespace Agenda\Agenda\Agenda\Infrastructure\UI\API\DataTransform;

use Agenda\Agenda\Agenda\Application\Query\GetAgendaCalendarDataTransform;
use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaCalendarResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetAgendaCalendarDataTransform implements GetAgendaCalendarDataTransform
{
    public function transform(GetAgendaCalendarResult $calendar): QueryResult
    {
        return new QuerySingleResult(item: $calendar);
    }
}
