<?php

namespace Gym\Library\Exercise\Domain\QueryModel;

interface DeleteExerciseNeedleDataQuery
{
    public function isReferenced(string $exerciseId): bool;
}
