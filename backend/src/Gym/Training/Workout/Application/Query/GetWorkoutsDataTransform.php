<?php

namespace Gym\Training\Workout\Application\Query;

use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetWorkoutsDataTransform
{
    /**
     * @param \Gym\Training\Workout\Domain\QueryModel\Dto\GetWorkoutsResult[] $workouts
     */
    public function transform(
        array $workouts,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
