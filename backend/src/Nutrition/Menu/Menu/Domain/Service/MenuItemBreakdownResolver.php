<?php

namespace Nutrition\Menu\Menu\Domain\Service;

use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuItemNodeView;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeBreakdownItem;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeBreakdownCalculator;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeNutritionCalculator;

/**
 * Single source of truth for what a menu item is made of: the stored node tree when the item has
 * one, the recipe expanded on the fly when it does not. Every read model must go through here so
 * the screen and the exported document never disagree.
 */
final readonly class MenuItemBreakdownResolver
{
    private const RECIPE_BASE_UNIT = 'g';
    private const RECIPE_SERVING_UNIT = 'rac.';

    public function __construct(
        private RecipeNutritionCalculator $calculator,
        private RecipeBreakdownCalculator $breakdownCalculator,
    ) {
    }

    /**
     * @param array<string, mixed> $item
     *
     * @return RecipeBreakdownItem[]
     */
    public function breakdownFor(RecipeNutritionGraph $graph, array $item): array
    {
        if (MenuItem::KIND_RECIPE !== $item['kind']) {
            return [];
        }

        $nodes = $item['nodes'] ?? [];

        if ([] !== $nodes) {
            return $this->itemsFromNodes(graph: $graph, nodes: $nodes);
        }

        return $this->breakdownCalculator->expand(
            graph: $graph,
            recipeId: $item['refId'],
            servings: $item['quantity'],
        );
    }

    /**
     * @param array<string, mixed>  $item
     * @param RecipeBreakdownItem[] $breakdown
     */
    public function macrosFor(RecipeNutritionGraph $graph, array $item, array $breakdown): MacroBreakdown
    {
        if ([] !== ($item['nodes'] ?? [])) {
            return $this->breakdownCalculator->total(items: $breakdown);
        }

        return $this->calculator->ingredientContribution(
            graph: $graph,
            kind: $item['kind'],
            refId: $item['refId'],
            quantity: $item['quantity'],
            unit: $item['unit'],
        );
    }

    /**
     * @param RecipeBreakdownItem[] $items
     *
     * @return MenuItemNodeView[]
     */
    public function nest(array $items, ?string $parentPath): array
    {
        $views = [];

        foreach ($items as $item) {
            if ($item->parentPath !== $parentPath) {
                continue;
            }

            $views[] = new MenuItemNodeView(
                path: $item->path,
                kind: $item->kind,
                refId: $item->refId,
                name: $item->name,
                emoji: $item->emoji,
                image: $item->image,
                quantity: round(num: $item->quantity, precision: 2),
                unit: $item->isRecipe() ? self::RECIPE_SERVING_UNIT : ($item->unit ?? self::RECIPE_BASE_UNIT),
                macros: $item->macros->rounded(),
                children: $this->nest(items: $items, parentPath: $item->path),
            );
        }

        return $views;
    }

    /**
     * @param array<int, array<string, mixed>> $nodes
     *
     * @return RecipeBreakdownItem[]
     */
    private function itemsFromNodes(RecipeNutritionGraph $graph, array $nodes): array
    {
        return array_map(static fn (array $node): RecipeBreakdownItem => new RecipeBreakdownItem(
            path: $node['path'],
            parentPath: RecipeBreakdownItem::parentPathOf(path: $node['path']),
            depth: (int) $node['depth'],
            position: (int) $node['position'],
            kind: $node['kind'],
            refId: $node['ref_id'],
            quantity: (float) $node['quantity'],
            unit: $node['unit'],
            name: $node['snapshot_name'],
            emoji: $node['snapshot_emoji'],
            image: $graph->imageFor(kind: $node['kind'], refId: $node['ref_id']),
            macros: new MacroBreakdown(
                calories: (float) $node['snapshot_calories'],
                protein: (float) $node['snapshot_protein'],
                fat: (float) $node['snapshot_fat'],
                carbs: (float) $node['snapshot_carbs'],
            ),
        ), $nodes);
    }
}
