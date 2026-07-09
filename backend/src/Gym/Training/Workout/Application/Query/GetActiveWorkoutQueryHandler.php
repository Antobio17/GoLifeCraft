<?php

namespace Gym\Training\Workout\Application\Query;

use Gym\Training\Workout\Domain\Exception\GetWorkoutException;
use Gym\Training\Workout\Domain\QueryModel\GetActiveWorkoutNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetActiveWorkoutQueryHandler
{
    public function __construct(
        private GetActiveWorkoutNeedleDataQuery $needleDataQuery,
        private GetWorkoutDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetActiveWorkoutQuery $query): QueryResult
    {
        $workout = $this->needleDataQuery->findActiveWorkoutByUser(
            userId: $query->userId,
        );

        if (null === $workout) {
            throw GetWorkoutException::noActiveWorkout();
        }

        return $this->dataTransform->transform(workout: $workout);
    }
}
