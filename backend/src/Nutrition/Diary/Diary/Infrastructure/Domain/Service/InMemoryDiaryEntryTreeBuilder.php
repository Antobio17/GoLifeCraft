<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntryTreeBuilder;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class InMemoryDiaryEntryTreeBuilder implements DiaryEntryTreeBuilder
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

    public function materialize(string $diaryEntryId, string $recipeId, float $servings, array $existingNodes, string $userId, ?string $productionItemId = null): array
    {
        $nodes = $this->expand(
            diaryEntryId: $diaryEntryId,
            key: $this->keyOf(recipeId: $recipeId, productionItemId: $productionItemId),
            servings: $servings,
            basePath: null,
            existingNodes: $existingNodes,
            userId: $userId,
        );

        return $this->withNestedRecipes(
            diaryEntryId: $diaryEntryId,
            nodes: $nodes,
            existingNodes: $existingNodes,
            userId: $userId,
        );
    }

    /**
     * A seeded set may describe the whole tree at once, with absolute parent paths, or only one
     * level and leave each sub-recipe seeded under its own key. Both are expanded.
     *
     * @param DiaryEntryNode[] $existingNodes
     *
     * @return DiaryEntryNode[]
     */
    private function expand(
        string $diaryEntryId,
        string $key,
        float $servings,
        ?string $basePath,
        array $existingNodes,
        string $userId,
    ): array {
        $existing = [];
        foreach ($existingNodes as $node) {
            $existing[$node->id] = $node;
        }

        $nodes = [];

        foreach ($this->definitions[$key] ?? [] as $item) {
            $quantity = $item['quantity'] * $servings;
            $snapshot = new DiaryEntrySnapshot(
                name: $item['name'],
                emoji: $item['emoji'],
                macros: $item['macros']->scale(factor: $servings),
            );
            $parentPath = $basePath ?? $item['parentPath'];
            $path = DiaryEntryNode::buildPath(parentPath: $parentPath, position: $item['position']);
            $node = $existing[DiaryEntryNode::buildId(diaryEntryId: $diaryEntryId, path: $path)] ?? null;

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
            }

            $nodes[] = $node ?? DiaryEntryNode::create(
                diaryEntryId: $diaryEntryId,
                parentPath: $parentPath,
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

    /**
     * @param DiaryEntryNode[] $nodes
     * @param DiaryEntryNode[] $existingNodes
     *
     * @return DiaryEntryNode[]
     */
    private function withNestedRecipes(string $diaryEntryId, array $nodes, array $existingNodes, string $userId): array
    {
        $expanded = $nodes;

        foreach ($nodes as $node) {
            if (!$node->isRecipe() || $this->hasChildren(nodes: $nodes, parent: $node)) {
                continue;
            }

            $children = $this->expand(
                diaryEntryId: $diaryEntryId,
                key: $this->keyOf(recipeId: $node->refId, productionItemId: $node->productionItemId),
                servings: $node->quantity,
                basePath: $node->path,
                existingNodes: $existingNodes,
                userId: $userId,
            );

            $expanded = array_merge($expanded, $this->withNestedRecipes(
                diaryEntryId: $diaryEntryId,
                nodes: $children,
                existingNodes: $existingNodes,
                userId: $userId,
            ));
        }

        return $expanded;
    }

    /**
     * @param DiaryEntryNode[] $nodes
     */
    private function hasChildren(array $nodes, DiaryEntryNode $parent): bool
    {
        foreach ($nodes as $node) {
            if ($node->isDescendantOf(other: $parent)) {
                return true;
            }
        }

        return false;
    }

    public function materializeSubtree(DiaryEntryNode $node, array $existingNodes, string $userId): array
    {
        $children = $this->expand(
            diaryEntryId: $node->diaryEntryId,
            key: $this->keyOf(recipeId: $node->refId, productionItemId: $node->productionItemId),
            servings: $node->quantity,
            basePath: $node->path,
            existingNodes: $existingNodes,
            userId: $userId,
        );

        return $this->withNestedRecipes(
            diaryEntryId: $node->diaryEntryId,
            nodes: $children,
            existingNodes: $existingNodes,
            userId: $userId,
        );
    }

    private function keyOf(string $recipeId, ?string $productionItemId): string
    {
        if (null === $productionItemId || !isset($this->definitions[$productionItemId])) {
            return $recipeId;
        }

        return $productionItemId;
    }

    public function fromPayload(string $diaryEntryId, array $tree, string $userId): array
    {
        return array_map(
            fn (array $node): DiaryEntryNode => DiaryEntryNode::create(
                diaryEntryId: $diaryEntryId,
                parentPath: $node['parentPath'] ?? null,
                kind: (string) $node['kind'],
                refId: (string) $node['refId'],
                quantity: (float) $node['quantity'],
                unit: $node['unit'] ?? null,
                position: (int) $node['position'],
                snapshot: new DiaryEntrySnapshot(
                    name: (string) $node['name'],
                    emoji: (string) $node['emoji'],
                    macros: new MacroBreakdown(
                        calories: (float) $node['calories'],
                        protein: (float) $node['protein'],
                        fat: (float) $node['fat'],
                        carbs: (float) $node['carbs'],
                    ),
                ),
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            ),
            $tree,
        );
    }

    public function refresh(array $nodes): MacroBreakdown
    {
        foreach ($nodes as $node) {
            if ($node->isRecipe()) {
                continue;
            }

            $node->applySnapshot(snapshot: new DiaryEntrySnapshot(
                name: $node->nameSnapshot,
                emoji: $node->emojiSnapshot,
                macros: $this->seededMacrosFor(node: $node),
            ));
        }

        foreach ($this->recipeNodesDeepestFirst(nodes: $nodes) as $node) {
            $node->applySnapshot(snapshot: new DiaryEntrySnapshot(
                name: $node->nameSnapshot,
                emoji: $node->emojiSnapshot,
                macros: $this->childrenTotal(nodes: $nodes, parentNodeId: $node->id),
            ));
        }

        return $this->childrenTotal(nodes: $nodes, parentNodeId: null);
    }

    private function seededMacrosFor(DiaryEntryNode $node): MacroBreakdown
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
     * @param DiaryEntryNode[] $nodes
     *
     * @return DiaryEntryNode[]
     */
    private function recipeNodesDeepestFirst(array $nodes): array
    {
        $recipes = array_values(array_filter($nodes, static fn (DiaryEntryNode $node): bool => $node->isRecipe()));
        usort($recipes, static fn (DiaryEntryNode $left, DiaryEntryNode $right): int => $right->depth <=> $left->depth);

        return $recipes;
    }

    /** @param DiaryEntryNode[] $nodes */
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
