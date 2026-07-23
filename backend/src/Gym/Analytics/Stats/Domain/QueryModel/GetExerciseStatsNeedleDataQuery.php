<?php

namespace Gym\Analytics\Stats\Domain\QueryModel;

use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetExerciseStatsResult;

interface GetExerciseStatsNeedleDataQuery
{
    public function fetchStats(string $exerciseId): GetExerciseStatsResult;
}
