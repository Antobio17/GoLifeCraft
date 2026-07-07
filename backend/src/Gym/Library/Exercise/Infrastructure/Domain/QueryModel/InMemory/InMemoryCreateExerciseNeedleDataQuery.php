<?php

namespace Gym\Library\Exercise\Infrastructure\Domain\QueryModel\InMemory;

use Gym\Library\Exercise\Domain\QueryModel\CreateExerciseNeedleDataQuery;

final class InMemoryCreateExerciseNeedleDataQuery implements CreateExerciseNeedleDataQuery
{
    private array $existingNames = [];

    public function addExistingName(string $name): void
    {
        $this->existingNames[] = $name;
    }

    public function exerciseWithNameAlreadyExists(
        string $name,
    ): bool {
        return in_array(needle: $name, haystack: $this->existingNames, strict: true);
    }
}
