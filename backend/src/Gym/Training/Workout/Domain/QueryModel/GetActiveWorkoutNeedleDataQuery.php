<?php

namespace Gym\Training\Workout\Domain\QueryModel;

use Gym\Training\Workout\Domain\QueryModel\Dto\GetWorkoutResult;

interface GetActiveWorkoutNeedleDataQuery
{
    public function findActiveWorkout(): ?GetWorkoutResult;
}
