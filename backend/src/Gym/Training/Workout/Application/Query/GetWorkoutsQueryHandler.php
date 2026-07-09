<?php

namespace Gym\Training\Workout\Application\Query;

use Gym\Training\Workout\Domain\QueryModel\GetWorkoutsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetWorkoutsQueryHandler
{
    public function __construct(
        private GetWorkoutsNeedleDataQuery $needleDataQuery,
        private GetWorkoutsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetWorkoutsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            workouts: $this->needleDataQuery->findWorkouts(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalWorkouts(),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
