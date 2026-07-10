<?php

namespace Gym\Library\Exercise\Infrastructure\Domain\QueryModel\InMemory;

use Gym\Library\Exercise\Domain\QueryModel\DeleteExerciseNeedleDataQuery;

final class InMemoryDeleteExerciseNeedleDataQuery implements DeleteExerciseNeedleDataQuery
{
    private array $referencedExerciseIds = [];

    public function addReferencedExerciseId(string $exerciseId): void
    {
        $this->referencedExerciseIds[] = $exerciseId;
    }

    public function isReferenced(string $exerciseId): bool
    {
        return in_array(needle: $exerciseId, haystack: $this->referencedExerciseIds, strict: true);
    }
}
