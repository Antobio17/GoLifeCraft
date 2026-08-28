<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionNeeds;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionSubRecipe;
use Nutrition\Kitchen\Production\Domain\QueryModel\FinishProductionNeedleDataQuery;

final class InMemoryFinishProductionNeedleDataQuery implements FinishProductionNeedleDataQuery
{
    /** @var array<string, array<int, array{articleId: string, quantity: float, unit: string, factor: float, baseUnit: string}>> */
    private array $articles = [];

    /** @var array<string, array<int, array{recipeId: string, servingsPerServing: float}>> */
    private array $subRecipes = [];

    public function addIngredient(
        string $recipeId,
        string $articleId,
        float $quantityPerServing,
        string $unit = 'g',
        float $factor = 1.0,
        string $baseUnit = 'g',
    ): void {
        $this->articles[$recipeId][] = [
            'articleId' => $articleId,
            'quantity' => $quantityPerServing,
            'unit' => $unit,
            'factor' => $factor,
            'baseUnit' => $baseUnit,
        ];
    }

    public function addSubRecipe(string $recipeId, string $subRecipeId, float $servingsPerServing): void
    {
        $this->subRecipes[$recipeId][] = [
            'recipeId' => $subRecipeId,
            'servingsPerServing' => $servingsPerServing,
        ];
    }

    public function resolveNeeds(string $recipeId, float $servings): ProductionNeeds
    {
        $articles = [];

        foreach ($this->articles[$recipeId] ?? [] as $ingredient) {
            $quantity = $ingredient['quantity'] * $servings;

            $articles[] = new ProductionIngredient(
                articleId: $ingredient['articleId'],
                name: $ingredient['articleId'],
                emoji: '🥕',
                quantity: $quantity,
                unit: $ingredient['unit'],
                baseQuantity: $quantity * $ingredient['factor'],
                baseUnit: $ingredient['baseUnit'],
            );
        }

        $subRecipes = [];

        foreach ($this->subRecipes[$recipeId] ?? [] as $subRecipe) {
            $subRecipes[] = new ProductionSubRecipe(
                recipeId: $subRecipe['recipeId'],
                name: $subRecipe['recipeId'],
                emoji: '🍲',
                servings: $subRecipe['servingsPerServing'] * $servings,
            );
        }

        return new ProductionNeeds(articles: $articles, subRecipes: $subRecipes);
    }
}
