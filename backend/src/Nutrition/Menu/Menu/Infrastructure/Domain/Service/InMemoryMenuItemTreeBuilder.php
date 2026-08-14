<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\Service;

use Nutrition\Menu\Menu\Domain\Model\MenuItemNode;
use Nutrition\Menu\Menu\Domain\Model\MenuNodeSnapshot;
use Nutrition\Menu\Menu\Domain\Service\MenuItemTreeBuilder;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class InMemoryMenuItemTreeBuilder implements MenuItemTreeBuilder
{
    /** @var array<string, array<int, array{kind: string, refId: string, parentPath: ?string, position: int, quantity: float, unit: ?string, name: string, emoji: string, macros: MacroBreakdown}>> */
    private array $definitions = [];

    public function __construct(
        private readonly DateTimeGenerator $dateTimeGenerator = new DateTimeGenerator(),
    ) {
    }

    public function withItem(
        string $recipeId,
        string $kind,
        string $refId,
        ?string $parentPath,
        int $position,
        float $quantity,
        ?string $unit,
        string $name,
        string $emoji,
        MacroBreakdown $macros,
    ): self {
        $this->definitions[$recipeId][] = compact('kind', 'refId', 'parentPath', 'position', 'quantity', 'unit', 'name', 'emoji', 'macros');

        return $this;
    }

    public function materialize(string $menuItemId, string $recipeId, float $servings, array $existingNodes, string $userId): array
    {
        $existing = [];
        foreach ($existingNodes as $node) {
            $existing[$node->id] = $node;
        }

        $nodes = [];

        foreach ($this->definitions[$recipeId] ?? [] as $item) {
            $quantity = $item['quantity'] * $servings;
            $snapshot = new MenuNodeSnapshot(
                name: $item['name'],
                emoji: $item['emoji'],
                macros: $item['macros']->scale(factor: $servings),
            );
            $path = MenuItemNode::buildPath(parentPath: $item['parentPath'], position: $item['position']);
            $node = $existing[MenuItemNode::buildId(menuItemId: $menuItemId, path: $path)] ?? null;

            if (null !== $node) {
                $node->rewrite(
                    kind: $item['kind'],
                    refId: $item['refId'],
                    quantity: $quantity,
                    unit: $item['unit'],
                    snapshot: $snapshot,
                    updatedByUserId: $userId,
                    dateTimeGenerator: $this->dateTimeGenerator,
                );

                $nodes[] = $node;

                continue;
            }

            $nodes[] = MenuItemNode::create(
                menuItemId: $menuItemId,
                parentPath: $item['parentPath'],
                kind: $item['kind'],
                refId: $item['refId'],
                quantity: $quantity,
                unit: $item['unit'],
                position: $item['position'],
                snapshot: $snapshot,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );
        }

        return $nodes;
    }

    public function refresh(array $nodes): MacroBreakdown
    {
        foreach ($nodes as $node) {
            if ($node->isRecipe()) {
                continue;
            }

            $node->applySnapshot(snapshot: new MenuNodeSnapshot(
                name: $node->nameSnapshot,
                emoji: $node->emojiSnapshot,
                macros: $this->seededMacrosFor(node: $node),
            ));
        }

        foreach ($this->recipeNodesDeepestFirst(nodes: $nodes) as $node) {
            $node->applySnapshot(snapshot: new MenuNodeSnapshot(
                name: $node->nameSnapshot,
                emoji: $node->emojiSnapshot,
                macros: $this->childrenTotal(nodes: $nodes, parentNodeId: $node->id),
            ));
        }

        return $this->childrenTotal(nodes: $nodes, parentNodeId: null);
    }

    private function seededMacrosFor(MenuItemNode $node): MacroBreakdown
    {
        foreach ($this->definitions as $items) {
            foreach ($items as $item) {
                if ($item['refId'] !== $node->refId || $item['quantity'] <= 0) {
                    continue;
                }

                return $item['macros']->scale(factor: $node->quantity / $item['quantity']);
            }
        }

        return $node->macros();
    }

    /**
     * @param MenuItemNode[] $nodes
     *
     * @return MenuItemNode[]
     */
    private function recipeNodesDeepestFirst(array $nodes): array
    {
        $recipes = array_values(array_filter($nodes, static fn (MenuItemNode $node): bool => $node->isRecipe()));
        usort($recipes, static fn (MenuItemNode $left, MenuItemNode $right): int => $right->depth <=> $left->depth);

        return $recipes;
    }

    /** @param MenuItemNode[] $nodes */
    private function childrenTotal(array $nodes, ?string $parentNodeId): MacroBreakdown
    {
        $total = MacroBreakdown::zero();

        foreach ($nodes as $node) {
            if ($node->parentNodeId !== $parentNodeId) {
                continue;
            }

            $total = $total->add(other: $node->macros());
        }

        return $total;
    }
}
