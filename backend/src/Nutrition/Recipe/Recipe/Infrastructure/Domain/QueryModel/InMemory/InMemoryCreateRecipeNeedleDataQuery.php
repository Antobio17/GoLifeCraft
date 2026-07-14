<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Recipe\Recipe\Domain\QueryModel\CreateRecipeNeedleDataQuery;

final class InMemoryCreateRecipeNeedleDataQuery implements CreateRecipeNeedleDataQuery
{
    private array $existingNames = [];

    public function addExistingName(string $name): void
    {
        $this->existingNames[] = $name;
    }

    public function recipeWithNameAlreadyExists(
        string $name,
    ): bool {
        return in_array(needle: $name, haystack: $this->existingNames, strict: true);
    }
}
