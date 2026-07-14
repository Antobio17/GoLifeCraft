<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Recipe\Recipe\Domain\QueryModel\UpdateRecipeNeedleDataQuery;

final class InMemoryUpdateRecipeNeedleDataQuery implements UpdateRecipeNeedleDataQuery
{
    private array $existingNamesByRecipeId = [];

    public function addExistingName(string $recipeId, string $name): void
    {
        $this->existingNamesByRecipeId[$recipeId] = $name;
    }

    public function recipeWithNameAlreadyExists(
        string $name,
        string $excludingRecipeId,
    ): bool {
        foreach ($this->existingNamesByRecipeId as $recipeId => $existingName) {
            if ($recipeId === $excludingRecipeId) {
                continue;
            }

            if ($existingName === $name) {
                return true;
            }
        }

        return false;
    }
}
