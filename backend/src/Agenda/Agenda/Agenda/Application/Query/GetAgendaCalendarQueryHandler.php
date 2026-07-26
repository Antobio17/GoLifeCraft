<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Agenda\Agenda\Agenda\Domain\QueryModel\GetAgendaCalendarNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetAgendaCalendarQueryHandler
{
    public function __construct(
        private GetAgendaCalendarNeedleDataQuery $needleDataQuery,
        private GetAgendaCalendarDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetAgendaCalendarQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            calendar: $this->needleDataQuery->findMonthCounts(month: $query->month),
        );
    }
}
