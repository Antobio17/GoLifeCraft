<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;
use Nutrition\Kitchen\Production\Domain\QueryModel\FinishProductionNeedleDataQuery;

final class InMemoryFinishProductionNeedleDataQuery implements FinishProductionNeedleDataQuery
{
    /** @var array<string, array<int, array{articleId: string, name: string, emoji: string, quantity: float, unit: string, factor: float, baseUnit: string}>> */
    private array $recipes = [];

    public function addIngredient(
        string $recipeId,
        string $articleId,
        float $quantityPerServing,
        string $unit = 'g',
        float $factor = 1.0,
        string $baseUnit = 'g',
    ): void {
        $this->recipes[$recipeId][] = [
            'articleId' => $articleId,
            'name' => $articleId,
            'emoji' => '🥕',
            'quantity' => $quantityPerServing,
            'unit' => $unit,
            'factor' => $factor,
            'baseUnit' => $baseUnit,
        ];
    }

    public function resolveIngredients(string $recipeId, float $servings): array
    {
        $ingredients = [];

        foreach ($this->recipes[$recipeId] ?? [] as $ingredient) {
            $quantity = $ingredient['quantity'] * $servings;

            $ingredients[] = new ProductionIngredient(
                articleId: $ingredient['articleId'],
                name: $ingredient['name'],
                emoji: $ingredient['emoji'],
                quantity: $quantity,
                unit: $ingredient['unit'],
                baseQuantity: $quantity * $ingredient['factor'],
                baseUnit: $ingredient['baseUnit'],
            );
        }

        return $ingredients;
    }
}
