<?php

namespace Gym\Analytics\Stats\Domain\QueryModel;

use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetExerciseTopSetsResult;

interface GetExerciseTopSetsNeedleDataQuery
{
    /**
     * @param array<int, string> $exerciseIds
     */
    public function fetchTopSets(array $exerciseIds): GetExerciseTopSetsResult;
}
