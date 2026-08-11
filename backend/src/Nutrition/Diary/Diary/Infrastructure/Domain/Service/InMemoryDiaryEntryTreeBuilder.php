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

    public function materialize(string $diaryEntryId, string $recipeId, float $servings, array $existingNodes, string $userId): array
    {
        $existing = [];
        foreach ($existingNodes as $node) {
            $existing[$node->id] = $node;
        }

        $nodes = [];

        foreach ($this->definitions[$recipeId] ?? [] as $item) {
            $quantity = $item['quantity'] * $servings;
            $snapshot = new DiaryEntrySnapshot(
                name: $item['name'],
                emoji: $item['emoji'],
                macros: $item['macros']->scale(factor: $servings),
            );
            $path = DiaryEntryNode::buildPath(parentPath: $item['parentPath'], position: $item['position']);
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

                $nodes[] = $node;

                continue;
            }

            $nodes[] = DiaryEntryNode::create(
                diaryEntryId: $diaryEntryId,
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
