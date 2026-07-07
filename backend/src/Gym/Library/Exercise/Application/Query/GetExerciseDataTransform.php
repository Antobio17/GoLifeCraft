<?php

namespace Gym\Library\Exercise\Application\Query;

use Gym\Library\Exercise\Domain\QueryModel\Dto\GetExerciseResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetExerciseDataTransform
{
    public function transform(GetExerciseResult $exercise): QueryResult;
}
