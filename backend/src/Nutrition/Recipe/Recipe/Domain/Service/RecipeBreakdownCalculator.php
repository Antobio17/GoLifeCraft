<?php

namespace Nutrition\Recipe\Recipe\Domain\Service;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeBreakdownItem;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;

final class RecipeBreakdownCalculator
{
    private const string DELETED_NAME = '(eliminado)';

    /**
     * Compositions given from the outside, keyed by the path of the recipe node they replace: a
     * sub-recipe pinned to a cooked batch is expanded with what that batch went in with, per
     * serving, instead of with what its recipe declares. A sub-recipe ingredient that carries its
     * own "composition" key does the same without being pinned by hand: it is the batch the
     * kitchen already recorded as its source.
     *
     * @param array<string, array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>> $compositionByPath
     *
     * @return RecipeBreakdownItem[]
     */
    public function expand(RecipeNutritionGraph $graph, string $recipeId, float $servings, array $compositionByPath = []): array
    {
        return $this->expandRecipe(
            graph: $graph,
            recipeId: $recipeId,
            servings: $servings,
            parentPath: null,
            depth: 0,
            stack: [],
            compositionByPath: $compositionByPath,
        );
    }

    /**
     * Same breakdown, but from an ingredient list given from the outside instead of the one the
     * recipe declares: what a cooked batch actually went in with.
     *
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>                $ingredients
     * @param array<string, array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>> $compositionByPath
     *
     * @return RecipeBreakdownItem[]
     */
    public function expandComposition(
        RecipeNutritionGraph $graph,
        array $ingredients,
        float $factor = 1.0,
        ?string $parentPath = null,
        int $depth = 0,
        array $compositionByPath = [],
    ): array {
        return $this->expandIngredients(
            graph: $graph,
            ingredients: $ingredients,
            factor: $factor,
            parentPath: $parentPath,
            depth: $depth,
            stack: [],
            compositionByPath: $compositionByPath,
        );
    }

    /**
     * @param RecipeBreakdownItem[] $items
     *
     * @return RecipeBreakdownItem[]
     */
    public function refresh(RecipeNutritionGraph $graph, array $items): array
    {
        $byDepth = $items;
        usort($byDepth, static fn (RecipeBreakdownItem $left, RecipeBreakdownItem $right): int => $right->depth <=> $left->depth);

        $refreshed = [];

        foreach ($byDepth as $item) {
            $refreshed[$item->path] = $item->isRecipe()
                ? $this->refreshRecipeItem(graph: $graph, item: $item, refreshed: $refreshed)
                : $this->refreshProductItem(graph: $graph, item: $item);
        }

        return array_map(static fn (RecipeBreakdownItem $item): RecipeBreakdownItem => $refreshed[$item->path], $items);
    }

    /** @param RecipeBreakdownItem[] $items */
    public function total(array $items): MacroBreakdown
    {
        $total = MacroBreakdown::zero();

        foreach ($items as $item) {
            if (null !== $item->parentPath) {
                continue;
            }

            $total = $total->add(other: $item->macros);
        }

        return $total;
    }

    /**
     * @param array<int, string>                                                                            $stack
     * @param array<string, array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>> $compositionByPath
     *
     * @return RecipeBreakdownItem[]
     */
    private function expandRecipe(
        RecipeNutritionGraph $graph,
        string $recipeId,
        float $servings,
        ?string $parentPath,
        int $depth,
        array $stack,
        array $compositionByPath,
    ): array {
        $composition = null === $parentPath ? null : ($compositionByPath[$parentPath] ?? null);

        if (null !== $composition) {
            return $this->expandIngredients(
                graph: $graph,
                ingredients: $composition,
                factor: $servings,
                parentPath: $parentPath,
                depth: $depth,
                stack: $stack,
                compositionByPath: $compositionByPath,
            );
        }

        if (!$graph->hasRecipe(recipeId: $recipeId) || in_array(needle: $recipeId, haystack: $stack, strict: true)) {
            return [];
        }

        return $this->expandIngredients(
            graph: $graph,
            ingredients: $graph->recipeIngredients(recipeId: $recipeId),
            factor: $servings / $graph->recipeServings(recipeId: $recipeId),
            parentPath: $parentPath,
            depth: $depth,
            stack: array_merge($stack, [$recipeId]),
            compositionByPath: $compositionByPath,
        );
    }

    /**
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>                $ingredients
     * @param array<int, string>                                                                            $stack
     * @param array<string, array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>> $compositionByPath
     *
     * @return RecipeBreakdownItem[]
     */
    private function expandIngredients(
        RecipeNutritionGraph $graph,
        array $ingredients,
        float $factor,
        ?string $parentPath,
        int $depth,
        array $stack,
        array $compositionByPath = [],
    ): array {
        $items = [];

        foreach (array_values($ingredients) as $position => $ingredient) {
            $path = RecipeBreakdownItem::buildPath(parentPath: $parentPath, position: $position);
            $quantity = RecipeBreakdownItem::round(value: $ingredient['quantity'] * $factor);

            if (RecipeBreakdownItem::KIND_PRODUCT === $ingredient['kind']) {
                $items[] = $this->productItem(
                    graph: $graph,
                    path: $path,
                    parentPath: $parentPath,
                    depth: $depth,
                    position: $position,
                    refId: $ingredient['refId'],
                    quantity: $quantity,
                    unit: $ingredient['unit'] ?? null,
                );

                continue;
            }

            $children = isset($ingredient['composition'])
                ? $this->expandIngredients(
                    graph: $graph,
                    ingredients: $ingredient['composition'],
                    factor: $quantity,
                    parentPath: $path,
                    depth: $depth + 1,
                    stack: $stack,
                    compositionByPath: $compositionByPath,
                )
                : $this->expandRecipe(
                    graph: $graph,
                    recipeId: $ingredient['refId'],
                    servings: $quantity,
                    parentPath: $path,
                    depth: $depth + 1,
                    stack: $stack,
                    compositionByPath: $compositionByPath,
                );

            $items[] = $this->recipeItem(
                graph: $graph,
                path: $path,
                parentPath: $parentPath,
                depth: $depth,
                position: $position,
                refId: $ingredient['refId'],
                quantity: $quantity,
                macros: $this->childrenTotal(parentPath: $path, items: $children),
            );

            $items = array_merge($items, $children);
        }

        return $items;
    }

    private function productItem(
        RecipeNutritionGraph $graph,
        string $path,
        ?string $parentPath,
        int $depth,
        int $position,
        string $refId,
        float $quantity,
        ?string $unit,
    ): RecipeBreakdownItem {
        return new RecipeBreakdownItem(
            path: $path,
            parentPath: $parentPath,
            depth: $depth,
            position: $position,
            kind: RecipeBreakdownItem::KIND_PRODUCT,
            refId: $refId,
            quantity: $quantity,
            unit: $unit ?? $graph->articleBaseUnit(articleId: $refId),
            name: $graph->articleName(articleId: $refId) ?? self::DELETED_NAME,
            emoji: $graph->articleEmoji(articleId: $refId),
            macros: $this->productMacros(graph: $graph, refId: $refId, quantity: $quantity, unit: $unit),
        );
    }

    private function recipeItem(
        RecipeNutritionGraph $graph,
        string $path,
        ?string $parentPath,
        int $depth,
        int $position,
        string $refId,
        float $quantity,
        MacroBreakdown $macros,
    ): RecipeBreakdownItem {
        return new RecipeBreakdownItem(
            path: $path,
            parentPath: $parentPath,
            depth: $depth,
            position: $position,
            kind: RecipeBreakdownItem::KIND_RECIPE,
            refId: $refId,
            quantity: $quantity,
            unit: null,
            name: $graph->recipeName(recipeId: $refId) ?? self::DELETED_NAME,
            emoji: $graph->recipeEmoji(recipeId: $refId),
            macros: $macros,
        );
    }

    private function refreshProductItem(RecipeNutritionGraph $graph, RecipeBreakdownItem $item): RecipeBreakdownItem
    {
        return $item->withSnapshot(
            name: $graph->articleName(articleId: $item->refId) ?? self::DELETED_NAME,
            emoji: $graph->articleEmoji(articleId: $item->refId),
            unit: $item->unit ?? $graph->articleBaseUnit(articleId: $item->refId),
            macros: $this->productMacros(graph: $graph, refId: $item->refId, quantity: $item->quantity, unit: $item->unit),
        );
    }

    /** @param array<string, RecipeBreakdownItem> $refreshed */
    private function refreshRecipeItem(RecipeNutritionGraph $graph, RecipeBreakdownItem $item, array $refreshed): RecipeBreakdownItem
    {
        return $item->withSnapshot(
            name: $graph->recipeName(recipeId: $item->refId) ?? self::DELETED_NAME,
            emoji: $graph->recipeEmoji(recipeId: $item->refId),
            unit: null,
            macros: $this->childrenTotal(parentPath: $item->path, items: array_values($refreshed)),
        );
    }

    private function productMacros(RecipeNutritionGraph $graph, string $refId, float $quantity, ?string $unit): MacroBreakdown
    {
        $perUnit = $graph->articleMacrosPerUnit(articleId: $refId);
        if (null === $perUnit) {
            return MacroBreakdown::zero();
        }

        return $perUnit->scale(factor: $quantity * $graph->articleUnitFactor(articleId: $refId, unit: $unit));
    }

    /** @param RecipeBreakdownItem[] $items */
    private function childrenTotal(string $parentPath, array $items): MacroBreakdown
    {
        $total = MacroBreakdown::zero();

        foreach ($items as $item) {
            if ($item->parentPath !== $parentPath) {
                continue;
            }

            $total = $total->add(other: $item->macros);
        }

        return $total;
    }
}
