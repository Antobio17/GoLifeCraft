<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Location\Domain\QueryModel\AssignLocationItemNeedleDataQuery;

final class InMemoryAssignLocationItemNeedleDataQuery implements AssignLocationItemNeedleDataQuery
{
    /** @var array<string, bool> */
    private array $references = [];

    /** @var array<string, string> */
    private array $locations = [];

    public function addReference(string $kind, string $refId, ?string $locationId = null): void
    {
        $this->references[$this->key(kind: $kind, refId: $refId)] = true;

        if (null === $locationId) {
            return;
        }

        $this->locations[$this->key(kind: $kind, refId: $refId)] = $locationId;
    }

    public function referenceExists(string $kind, string $refId): bool
    {
        return $this->references[$this->key(kind: $kind, refId: $refId)] ?? false;
    }

    public function currentLocationId(string $kind, string $refId): ?string
    {
        return $this->locations[$this->key(kind: $kind, refId: $refId)] ?? null;
    }

    private function key(string $kind, string $refId): string
    {
        return $kind.':'.$refId;
    }
}
