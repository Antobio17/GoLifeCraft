<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Agenda\Agenda\Agenda\Domain\QueryModel\GetAgendaDayNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetAgendaDayQueryHandler
{
    public function __construct(
        private GetAgendaDayNeedleDataQuery $needleDataQuery,
        private GetAgendaDayDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetAgendaDayQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            day: $this->needleDataQuery->findDay(date: $query->date),
        );
    }
}
