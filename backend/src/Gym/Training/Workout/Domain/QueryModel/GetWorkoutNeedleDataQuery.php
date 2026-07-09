<?php

namespace Gym\Training\Workout\Domain\QueryModel;

use Gym\Training\Workout\Domain\QueryModel\Dto\GetWorkoutResult;

interface GetWorkoutNeedleDataQuery
{
    public function findWorkoutById(string $workoutId): ?GetWorkoutResult;
}
