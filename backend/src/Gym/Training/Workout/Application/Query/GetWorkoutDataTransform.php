<?php

namespace Gym\Training\Workout\Application\Query;

use Gym\Training\Workout\Domain\QueryModel\Dto\GetWorkoutResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetWorkoutDataTransform
{
    public function transform(GetWorkoutResult $workout): QueryResult;
}
