<?php

namespace Gym\Analytics\Stats\Application\Query;

use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetExerciseStatsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetExerciseStatsDataTransform
{
    public function transform(GetExerciseStatsResult $stats): QueryResult;
}
