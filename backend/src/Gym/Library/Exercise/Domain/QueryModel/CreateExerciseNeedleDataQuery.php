<?php

namespace Gym\Library\Exercise\Domain\QueryModel;

interface CreateExerciseNeedleDataQuery
{
    public function exerciseWithNameAlreadyExists(
        string $name,
        ?string $excludingExerciseId = null,
    ): bool;
}
