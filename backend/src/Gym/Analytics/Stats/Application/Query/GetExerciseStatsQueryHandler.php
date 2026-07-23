<?php

namespace Gym\Analytics\Stats\Application\Query;

use Gym\Analytics\Stats\Domain\QueryModel\GetExerciseStatsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetExerciseStatsQueryHandler
{
    public function __construct(
        private GetExerciseStatsNeedleDataQuery $needleDataQuery,
        private GetExerciseStatsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetExerciseStatsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            stats: $this->needleDataQuery->fetchStats(exerciseId: $query->exerciseId),
        );
    }
}
