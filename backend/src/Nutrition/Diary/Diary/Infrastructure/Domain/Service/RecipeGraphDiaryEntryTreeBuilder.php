<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntryTreeBuilder;
use Nutrition\Diary\Diary\Domain\Service\DiaryLotCompositionProvider;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeBreakdownItem;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeBreakdownCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class RecipeGraphDiaryEntryTreeBuilder implements DiaryEntryTreeBuilder
{
    private ?RecipeNutritionGraph $graph = null;

    public function __construct(
        private readonly DoctrineRecipeNutritionGraphProvider $graphProvider,
        private readonly RecipeBreakdownCalculator $calculator,
        private readonly DiaryLotCompositionProvider $lotCompositionProvider,
        private readonly DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function materialize(string $diaryEntryId, string $recipeId, float $servings, array $existingNodes, string $userId, ?string $productionItemId = null): array
    {
        return $this->toNodes(
            diaryEntryId: $diaryEntryId,
            items: $this->breakdownOf(
                recipeId: $recipeId,
                servings: $servings,
                productionItemId: $productionItemId,
                compositionByPath: $this->pinnedCompositions(nodes: $existingNodes),
            ),
            existingNodes: $existingNodes,
            userId: $userId,
        );
    }

    public function materializeSubtree(DiaryEntryNode $node, array $existingNodes, string $userId): array
    {
        $composition = null === $node->productionItemId
            ? null
            : $this->lotCompositionProvider->findComposition(productionItemId: $node->productionItemId);

        $pinned = $this->pinnedCompositions(nodes: $existingNodes);
        $graph = $this->graph();

        $items = null === $composition
            ? $this->calculator->expandComposition(
                graph: $graph,
                ingredients: $graph->recipeIngredients(recipeId: $node->refId),
                factor: $node->quantity / $graph->recipeServings(recipeId: $node->refId),
                parentPath: $node->path,
                depth: $node->depth + 1,
                compositionByPath: $pinned,
            )
            : $this->calculator->expandComposition(
                graph: $graph,
                ingredients: $composition->scaledTo(servings: $node->quantity),
                parentPath: $node->path,
                depth: $node->depth + 1,
                compositionByPath: $pinned,
            );

        return $this->toNodes(
            diaryEntryId: $node->diaryEntryId,
            items: $items,
            existingNodes: $existingNodes,
            userId: $userId,
        );
    }

    /**
     * A batch already carries the whole chain of what was cooked, its sub-recipes included, so a
     * batch pinned to a single node only has a say while the entry itself follows its recipe.
     *
     * @param array<string, array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>> $compositionByPath
     *
     * @return RecipeBreakdownItem[]
     */
    private function breakdownOf(string $recipeId, float $servings, ?string $productionItemId, array $compositionByPath): array
    {
        $composition = null === $productionItemId
            ? null
            : $this->lotCompositionProvider->findComposition(productionItemId: $productionItemId);

        if (null === $composition) {
            return $this->calculator->expand(
                graph: $this->graph(),
                recipeId: $recipeId,
                servings: $servings,
                compositionByPath: $compositionByPath,
            );
        }

        return $this->calculator->expandComposition(
            graph: $this->graph(),
            ingredients: $composition->scaledTo(servings: $servings),
        );
    }

    /**
     * @param DiaryEntryNode[] $nodes
     *
     * @return array<string, array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>>
     */
    private function pinnedCompositions(array $nodes): array
    {
        $compositions = [];

        foreach ($nodes as $node) {
            if (null === $node->productionItemId) {
                continue;
            }

            $composition = $this->lotCompositionProvider->findComposition(productionItemId: $node->productionItemId);

            if (null === $composition) {
                continue;
            }

            $compositions[$node->path] = $composition->ingredientsPerServing;
        }

        return $compositions;
    }

    /**
     * @param RecipeBreakdownItem[] $items
     * @param DiaryEntryNode[]      $existingNodes
     *
     * @return DiaryEntryNode[]
     */
    private function toNodes(string $diaryEntryId, array $items, array $existingNodes, string $userId): array
    {
        $existing = [];
        foreach ($existingNodes as $node) {
            $existing[$node->id] = $node;
        }

        $nodes = [];
        foreach ($items as $item) {
            $nodes[] = $this->toNode(diaryEntryId: $diaryEntryId, item: $item, existing: $existing, userId: $userId);
        }

        return $nodes;
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
        if ([] === $nodes) {
            return MacroBreakdown::zero();
        }

        $ordered = array_values($nodes);
        $items = array_map(
            static fn (DiaryEntryNode $node): RecipeBreakdownItem => new RecipeBreakdownItem(
                path: $node->path,
                parentPath: self::parentPathOf(node: $node),
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

        $refreshed = $this->calculator->refresh(graph: $this->graph(), items: $items);

        foreach ($ordered as $index => $node) {
            $item = $refreshed[$index];
            $node->unit = $item->unit;
            $node->applySnapshot(snapshot: new DiaryEntrySnapshot(name: $item->name, emoji: $item->emoji, macros: $item->macros));
        }

        return $this->calculator->total(items: $refreshed);
    }

    /**
     * @param array<string, DiaryEntryNode> $existing
     */
    private function toNode(string $diaryEntryId, RecipeBreakdownItem $item, array $existing, string $userId): DiaryEntryNode
    {
        $snapshot = new DiaryEntrySnapshot(name: $item->name, emoji: $item->emoji, macros: $item->macros);
        $node = $existing[DiaryEntryNode::buildId(diaryEntryId: $diaryEntryId, path: $item->path)] ?? null;

        if (null === $node) {
            return DiaryEntryNode::create(
                diaryEntryId: $diaryEntryId,
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

    private function graph(): RecipeNutritionGraph
    {
        return $this->graph ??= $this->graphProvider->load();
    }

    private static function parentPathOf(DiaryEntryNode $node): ?string
    {
        $separator = strrpos(haystack: $node->path, needle: DiaryEntryNode::PATH_SEPARATOR);

        return false === $separator ? null : substr(string: $node->path, offset: 0, length: $separator);
    }
}
