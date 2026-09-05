<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Location\Domain\QueryModel\UpdateLocationNeedleDataQuery;

final class InMemoryUpdateLocationNeedleDataQuery implements UpdateLocationNeedleDataQuery
{
    /**
     * @param array<string, string> $namesById
     */
    public function __construct(private array $namesById = [])
    {
    }

    public function alreadyExists(string $name, string $locationId): bool
    {
        foreach ($this->namesById as $id => $existingName) {
            if ($id !== $locationId && $existingName === $name) {
                return true;
            }
        }

        return false;
    }
}
