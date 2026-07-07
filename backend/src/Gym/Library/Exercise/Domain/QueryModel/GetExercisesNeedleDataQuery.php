<?php

namespace Gym\Library\Exercise\Domain\QueryModel;

interface GetExercisesNeedleDataQuery
{
    public function findExercises(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $filterType = null,
        ?string $filterMuscleGroup = null,
        ?string $orderBy = null,
    ): array;

    public function totalExercises(
        ?string $filterName = null,
        ?string $filterType = null,
        ?string $filterMuscleGroup = null,
    ): int;
}
