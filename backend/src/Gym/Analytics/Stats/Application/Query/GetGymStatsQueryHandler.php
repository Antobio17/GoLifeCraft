<?php

namespace Gym\Analytics\Stats\Application\Query;

use Gym\Analytics\Stats\Domain\QueryModel\GetGymStatsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetGymStatsQueryHandler
{
    public function __construct(
        private GetGymStatsNeedleDataQuery $needleDataQuery,
        private GetGymStatsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetGymStatsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            stats: $this->needleDataQuery->fetchStats(),
        );
    }
}
