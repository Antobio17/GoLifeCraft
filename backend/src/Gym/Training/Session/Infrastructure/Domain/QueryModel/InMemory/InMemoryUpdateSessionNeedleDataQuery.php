<?php

namespace Gym\Training\Session\Infrastructure\Domain\QueryModel\InMemory;

use Gym\Training\Session\Domain\QueryModel\UpdateSessionNeedleDataQuery;

final class InMemoryUpdateSessionNeedleDataQuery implements UpdateSessionNeedleDataQuery
{
    private array $existingNamesBySessionId = [];

    public function addExistingName(string $sessionId, string $name): void
    {
        $this->existingNamesBySessionId[$sessionId] = $name;
    }

    public function sessionWithNameAlreadyExists(
        string $name,
        string $excludingSessionId,
    ): bool {
        foreach ($this->existingNamesBySessionId as $sessionId => $existingName) {
            if ($sessionId === $excludingSessionId) {
                continue;
            }

            if ($existingName === $name) {
                return true;
            }
        }

        return false;
    }
}
