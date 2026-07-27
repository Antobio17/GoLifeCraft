<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Agenda\Agenda\Agenda\Domain\QueryModel\GetAgendaUpcomingNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetAgendaUpcomingQueryHandler
{
    public function __construct(
        private GetAgendaUpcomingNeedleDataQuery $needleDataQuery,
        private GetAgendaUpcomingDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetAgendaUpcomingQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            upcoming: $this->needleDataQuery->findUpcoming(
                fromDate: $query->fromDate,
                days: $query->days,
            ),
        );
    }
}
