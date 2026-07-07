<?php

namespace Gym\Training\Session\Application\Query;

use Gym\Training\Session\Domain\QueryModel\GetSessionsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetSessionsQueryHandler
{
    public function __construct(
        private GetSessionsNeedleDataQuery $needleDataQuery,
        private GetSessionsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetSessionsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            sessions: $this->needleDataQuery->findSessions(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterName: $query->filterName,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalSessions(
                filterName: $query->filterName,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
