<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Agenda\Agenda\Agenda\Domain\Exception\GetAgendaEntrySeriesException;
use Agenda\Agenda\Agenda\Domain\QueryModel\GetAgendaEntrySeriesNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetAgendaEntrySeriesQueryHandler
{
    public function __construct(
        private GetAgendaEntrySeriesNeedleDataQuery $needleDataQuery,
        private GetAgendaEntrySeriesDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetAgendaEntrySeriesQuery $query): QueryResult
    {
        $series = $this->needleDataQuery->findSeriesById(seriesId: $query->seriesId);

        if (null === $series) {
            throw GetAgendaEntrySeriesException::notFound(seriesId: $query->seriesId);
        }

        return $this->dataTransform->transform(series: $series);
    }
}
