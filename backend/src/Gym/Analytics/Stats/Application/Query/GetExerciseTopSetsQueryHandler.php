<?php

namespace Gym\Analytics\Stats\Application\Query;

use Gym\Analytics\Stats\Domain\QueryModel\GetExerciseTopSetsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetExerciseTopSetsQueryHandler
{
    public function __construct(
        private GetExerciseTopSetsNeedleDataQuery $needleDataQuery,
        private GetExerciseTopSetsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetExerciseTopSetsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            topSets: $this->needleDataQuery->fetchTopSets(exerciseIds: $query->exerciseIds),
        );
    }
}
