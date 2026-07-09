<?php

namespace Gym\Training\Workout\Domain\QueryModel;

use Gym\Training\Workout\Domain\QueryModel\Dto\GetWorkoutsResult;

interface GetWorkoutsNeedleDataQuery
{
    /**
     * @return GetWorkoutsResult[]
     */
    public function findWorkouts(
        int $pageSize,
        int $pageNumber,
        ?string $orderBy = null,
    ): array;

    public function totalWorkouts(): int;
}
