<?php

namespace Nutrition\Recipe\Recipe\Domain\Service;

use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;

final class RecipeNutritionCalculator
{
    public function totalsFor(RecipeNutritionGraph $graph, string $recipeId): MacroBreakdown
    {
        return $this->recipeTotals(graph: $graph, recipeId: $recipeId, stack: []);
    }

    public function perServingFor(RecipeNutritionGraph $graph, string $recipeId): MacroBreakdown
    {
        return $this->recipeTotals(graph: $graph, recipeId: $recipeId, stack: [])
            ->scale(factor: 1 / $graph->recipeServings(recipeId: $recipeId));
    }

    public function ingredientContribution(RecipeNutritionGraph $graph, string $kind, string $refId, float $quantity): MacroBreakdown
    {
        return $this->contribution(graph: $graph, kind: $kind, refId: $refId, quantity: $quantity, stack: []);
    }

    /**
     * @return array<int, string>
     */
    public function recipesContaining(RecipeNutritionGraph $graph, string $refId): array
    {
        $containing = [];

        foreach ($graph->recipeIds() as $recipeId) {
            if ($this->recipeContains(graph: $graph, recipeId: $recipeId, targetRefId: $refId, stack: [])) {
                $containing[] = $recipeId;
            }
        }

        return $containing;
    }

    /**
     * @param array<int, string> $stack
     */
    private function recipeContains(RecipeNutritionGraph $graph, string $recipeId, string $targetRefId, array $stack): bool
    {
        if (!$graph->hasRecipe(recipeId: $recipeId) || in_array(needle: $recipeId, haystack: $stack, strict: true)) {
            return false;
        }

        $nextStack = array_merge($stack, [$recipeId]);

        foreach ($graph->recipeIngredients(recipeId: $recipeId) as $ingredient) {
            if ($ingredient['refId'] === $targetRefId) {
                return true;
            }

            if (RecipeIngredient::KIND_PRODUCT !== $ingredient['kind']
                && $this->recipeContains(graph: $graph, recipeId: $ingredient['refId'], targetRefId: $targetRefId, stack: $nextStack)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param array<int, string> $stack
     */
    private function recipeTotals(RecipeNutritionGraph $graph, string $recipeId, array $stack): MacroBreakdown
    {
        if (!$graph->hasRecipe(recipeId: $recipeId) || in_array(needle: $recipeId, haystack: $stack, strict: true)) {
            return MacroBreakdown::zero();
        }

        $nextStack = array_merge($stack, [$recipeId]);
        $total = MacroBreakdown::zero();

        foreach ($graph->recipeIngredients(recipeId: $recipeId) as $ingredient) {
            $total = $total->add(other: $this->contribution(
                graph: $graph,
                kind: $ingredient['kind'],
                refId: $ingredient['refId'],
                quantity: $ingredient['quantity'],
                stack: $nextStack,
            ));
        }

        return $total;
    }

    /**
     * @param array<int, string> $stack
     */
    private function contribution(RecipeNutritionGraph $graph, string $kind, string $refId, float $quantity, array $stack): MacroBreakdown
    {
        if (RecipeIngredient::KIND_PRODUCT === $kind) {
            $perUnit = $graph->articleMacrosPerUnit(articleId: $refId);

            return null === $perUnit ? MacroBreakdown::zero() : $perUnit->scale(factor: $quantity);
        }

        if (!$graph->hasRecipe(recipeId: $refId)) {
            return MacroBreakdown::zero();
        }

        return $this->recipeTotals(graph: $graph, recipeId: $refId, stack: $stack)
            ->scale(factor: $quantity / $graph->recipeServings(recipeId: $refId));
    }
}
