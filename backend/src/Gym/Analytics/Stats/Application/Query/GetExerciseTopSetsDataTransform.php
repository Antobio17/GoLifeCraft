<?php

namespace Gym\Analytics\Stats\Application\Query;

use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetExerciseTopSetsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetExerciseTopSetsDataTransform
{
    public function transform(GetExerciseTopSetsResult $topSets): QueryResult;
}
