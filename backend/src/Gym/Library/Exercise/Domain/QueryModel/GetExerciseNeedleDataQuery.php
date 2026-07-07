<?php

namespace Gym\Library\Exercise\Domain\QueryModel;

use Gym\Library\Exercise\Domain\QueryModel\Dto\GetExerciseResult;

interface GetExerciseNeedleDataQuery
{
    public function findExerciseById(string $exerciseId): ?GetExerciseResult;
}
