<?php

namespace Gym\Library\Exercise\Infrastructure\Domain\QueryModel\InMemory;

use Gym\Library\Exercise\Domain\QueryModel\UpdateExerciseNeedleDataQuery;

final class InMemoryUpdateExerciseNeedleDataQuery implements UpdateExerciseNeedleDataQuery
{
    private array $existingNamesByExerciseId = [];

    public function addExistingName(string $exerciseId, string $name): void
    {
        $this->existingNamesByExerciseId[$exerciseId] = $name;
    }

    public function exerciseWithNameAlreadyExists(
        string $name,
        string $excludingExerciseId,
    ): bool {
        foreach ($this->existingNamesByExerciseId as $exerciseId => $existingName) {
            if ($exerciseId === $excludingExerciseId) {
                continue;
            }

            if ($existingName === $name) {
                return true;
            }
        }

        return false;
    }
}
