<?php

namespace Gym\Training\Workout\Application\Query;

use Gym\Training\Workout\Domain\Exception\GetWorkoutException;
use Gym\Training\Workout\Domain\QueryModel\GetWorkoutNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetWorkoutQueryHandler
{
    public function __construct(
        private GetWorkoutNeedleDataQuery $needleDataQuery,
        private GetWorkoutDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetWorkoutQuery $query): QueryResult
    {
        $workout = $this->needleDataQuery->findWorkoutById(
            workoutId: $query->workoutId,
        );

        if (null === $workout) {
            throw GetWorkoutException::notFound(workoutId: $query->workoutId);
        }

        return $this->dataTransform->transform(workout: $workout);
    }
}
