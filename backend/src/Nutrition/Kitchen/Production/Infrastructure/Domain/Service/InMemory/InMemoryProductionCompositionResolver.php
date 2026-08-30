<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\Service\InMemory;

use Nutrition\Kitchen\Production\Domain\Exception\AdjustProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\ProductionCompositionLine;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItemConsumption;
use Nutrition\Kitchen\Production\Domain\Service\ProductionCompositionResolver;

final class InMemoryProductionCompositionResolver implements ProductionCompositionResolver
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

    public function fromRecipe(string $recipeId, float $servings): array
    {
        $merged = [];

        foreach ($this->articles[$recipeId] ?? [] as $ingredient) {
            $quantity = $ingredient['quantity'] * $servings;
            $articleId = $ingredient['articleId'];
            $line = ProductionCompositionLine::article(
                articleId: $articleId,
                baseQuantity: $quantity * $ingredient['factor'],
                baseUnit: $ingredient['baseUnit'],
                displayQuantity: $quantity,
                displayUnit: $ingredient['unit'],
            );

            $merged[$articleId] = isset($merged[$articleId])
                ? ProductionCompositionLine::article(
                    articleId: $articleId,
                    baseQuantity: $merged[$articleId]->quantity + $line->quantity,
                    baseUnit: $line->unit ?? '',
                    displayQuantity: $merged[$articleId]->displayQuantity + $line->displayQuantity,
                    displayUnit: $line->displayUnit,
                )
                : $line;
        }

        $lines = array_values(array: $merged);

        foreach ($this->subRecipes[$recipeId] ?? [] as $subRecipe) {
            $lines[] = ProductionCompositionLine::subRecipe(
                recipeId: $subRecipe['recipeId'],
                servings: $subRecipe['servingsPerServing'] * $servings,
            );
        }

        return $lines;
    }

    public function fromLines(array $lines): array
    {
        return array_values(array: array_map(callback: function (array $line): ProductionCompositionLine {
            $quantity = (float) $line['quantity'];

            if ($quantity <= 0.0) {
                throw AdjustProductionItemException::quantityMustBePositive(refId: $line['refId'], quantity: $quantity);
            }

            if (ProductionItemConsumption::KIND_RECIPE === $line['kind']) {
                return ProductionCompositionLine::subRecipe(recipeId: $line['refId'], servings: $quantity);
            }

            return ProductionCompositionLine::article(
                articleId: $line['refId'],
                baseQuantity: $quantity,
                baseUnit: (string) ($line['unit'] ?? 'g'),
                displayQuantity: $quantity,
                displayUnit: (string) ($line['unit'] ?? 'g'),
            );
        }, array: array_values(array: $lines)));
    }
}
