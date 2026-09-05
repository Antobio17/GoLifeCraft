<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Location\Domain\QueryModel\CreateLocationNeedleDataQuery;

final class InMemoryCreateLocationNeedleDataQuery implements CreateLocationNeedleDataQuery
{
    /**
     * @param string[] $existingNames
     */
    public function __construct(private array $existingNames = [])
    {
    }

    public function alreadyExists(string $name): bool
    {
        return in_array(needle: $name, haystack: $this->existingNames, strict: true);
    }
}
