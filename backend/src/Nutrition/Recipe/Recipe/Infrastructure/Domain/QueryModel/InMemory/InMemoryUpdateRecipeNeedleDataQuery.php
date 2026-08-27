<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Recipe\Recipe\Application\Command\RecipeStepData;
use Nutrition\Recipe\Recipe\Domain\QueryModel\UpdateRecipeNeedleDataQuery;

final class InMemoryUpdateRecipeNeedleDataQuery implements UpdateRecipeNeedleDataQuery
{
    private array $existingNamesByRecipeId = [];

    /** @var array<string, RecipeStepData[]> */
    private array $stepsByRecipeId = [];

    public function addExistingName(string $recipeId, string $name): void
    {
        $this->existingNamesByRecipeId[$recipeId] = $name;
    }

    /**
     * @param RecipeStepData[] $steps
     */
    public function addSteps(string $recipeId, array $steps): void
    {
        $this->stepsByRecipeId[$recipeId] = $steps;
    }

    public function findStepsOf(string $recipeId): array
    {
        return $this->stepsByRecipeId[$recipeId] ?? [];
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
