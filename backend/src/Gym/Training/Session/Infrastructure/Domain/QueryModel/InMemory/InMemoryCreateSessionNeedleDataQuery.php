<?php

namespace Gym\Training\Session\Infrastructure\Domain\QueryModel\InMemory;

use Gym\Training\Session\Domain\QueryModel\CreateSessionNeedleDataQuery;

final class InMemoryCreateSessionNeedleDataQuery implements CreateSessionNeedleDataQuery
{
    private array $existingNames = [];

    public function addExistingName(string $name): void
    {
        $this->existingNames[] = $name;
    }

    public function sessionWithNameAlreadyExists(
        string $name,
    ): bool {
        return in_array(needle: $name, haystack: $this->existingNames, strict: true);
    }
}
