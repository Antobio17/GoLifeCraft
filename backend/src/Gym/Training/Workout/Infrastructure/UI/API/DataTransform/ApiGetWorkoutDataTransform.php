<?php

namespace Gym\Training\Workout\Infrastructure\UI\API\DataTransform;

use Gym\Training\Workout\Application\Query\GetWorkoutDataTransform;
use Gym\Training\Workout\Domain\QueryModel\Dto\GetWorkoutResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetWorkoutDataTransform implements GetWorkoutDataTransform
{
    public function transform(GetWorkoutResult $workout): QueryResult
    {
        return new QuerySingleResult(item: $workout);
    }
}
