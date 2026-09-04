<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\Service;

use Nutrition\Menu\Menu\Domain\Model\MenuItemNode;
use Nutrition\Menu\Menu\Domain\Model\MenuNodeSnapshot;
use Nutrition\Menu\Menu\Domain\Service\MenuItemTreeBuilder;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeBreakdownItem;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeBreakdownCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RecipeGraphMenuItemTreeBuilder implements MenuItemTreeBuilder
{
    public function __construct(
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private RecipeBreakdownCalculator $calculator,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function materialize(string $menuItemId, string $recipeId, float $servings, array $existingNodes, string $userId): array
    {
        $items = $this->calculator->expand(
            graph: $this->graphProvider->load(),
            recipeId: $recipeId,
            servings: $servings,
        );

        $existing = [];
        foreach ($existingNodes as $node) {
            $existing[$node->id] = $node;
        }

        $nodes = [];
        foreach ($items as $item) {
            $nodes[] = $this->toNode(menuItemId: $menuItemId, item: $item, existing: $existing, userId: $userId);
        }

        return $nodes;
    }

    public function refresh(array $nodes): MacroBreakdown
    {
        if ([] === $nodes) {
            return MacroBreakdown::zero();
        }

        $ordered = array_values($nodes);
        $items = array_map(
            static fn (MenuItemNode $node): RecipeBreakdownItem => new RecipeBreakdownItem(
                path: $node->path,
                parentPath: $node->parentPath(),
                depth: $node->depth,
                position: $node->position,
                kind: $node->kind,
                refId: $node->refId,
                quantity: $node->quantity,
                unit: $node->unit,
                name: $node->nameSnapshot,
                emoji: $node->emojiSnapshot,
                image: null,
                macros: $node->macros(),
            ),
            $ordered,
        );

        $refreshed = $this->calculator->refresh(graph: $this->graphProvider->load(), items: $items);

        foreach ($ordered as $index => $node) {
            $item = $refreshed[$index];
            $node->unit = $item->unit;
            $node->applySnapshot(snapshot: new MenuNodeSnapshot(name: $item->name, emoji: $item->emoji, macros: $item->macros));
        }

        return $this->calculator->total(items: $refreshed);
    }

    /**
     * @param array<string, MenuItemNode> $existing
     */
    private function toNode(string $menuItemId, RecipeBreakdownItem $item, array $existing, string $userId): MenuItemNode
    {
        $snapshot = new MenuNodeSnapshot(name: $item->name, emoji: $item->emoji, macros: $item->macros);
        $node = $existing[MenuItemNode::buildId(menuItemId: $menuItemId, path: $item->path)] ?? null;

        if (null === $node) {
            return MenuItemNode::create(
                menuItemId: $menuItemId,
                parentPath: $item->parentPath,
                kind: $item->kind,
                refId: $item->refId,
                quantity: $item->quantity,
                unit: $item->unit,
                position: $item->position,
                snapshot: $snapshot,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );
        }

        $node->rewrite(
            kind: $item->kind,
            refId: $item->refId,
            quantity: $item->quantity,
            unit: $item->unit,
            snapshot: $snapshot,
            updatedByUserId: $userId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        return $node;
    }
}
