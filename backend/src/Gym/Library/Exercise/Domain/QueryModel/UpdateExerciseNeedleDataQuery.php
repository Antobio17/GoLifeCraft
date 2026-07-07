<?php

namespace Gym\Library\Exercise\Domain\QueryModel;

interface UpdateExerciseNeedleDataQuery
{
    public function exerciseWithNameAlreadyExists(
        string $name,
        string $excludingExerciseId,
    ): bool;
}
