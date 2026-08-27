<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionRecipeSnapshot;
use Nutrition\Kitchen\Production\Domain\QueryModel\StartProductionNeedleDataQuery;

final class InMemoryStartProductionNeedleDataQuery implements StartProductionNeedleDataQuery
{
    /** @var array<string, ProductionRecipeSnapshot> */
    private array $recipes = [];

    public function addRecipe(string $recipeId, string $name, string $emoji, int $servings): void
    {
        $this->recipes[$recipeId] = new ProductionRecipeSnapshot(
            recipeId: $recipeId,
            name: $name,
            emoji: $emoji,
            servings: $servings,
        );
    }

    public function findRecipeSnapshot(string $recipeId): ?ProductionRecipeSnapshot
    {
        return $this->recipes[$recipeId] ?? null;
    }
}
