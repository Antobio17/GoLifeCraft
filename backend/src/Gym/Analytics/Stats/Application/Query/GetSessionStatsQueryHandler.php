<?php

namespace Gym\Analytics\Stats\Application\Query;

use Gym\Analytics\Stats\Domain\QueryModel\GetSessionStatsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetSessionStatsQueryHandler
{
    public function __construct(
        private GetSessionStatsNeedleDataQuery $needleDataQuery,
        private GetSessionStatsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetSessionStatsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            stats: $this->needleDataQuery->fetchStats(sessionId: $query->sessionId),
        );
    }
}
