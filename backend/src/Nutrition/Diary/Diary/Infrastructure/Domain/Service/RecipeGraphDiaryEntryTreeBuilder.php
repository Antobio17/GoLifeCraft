<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryBreakdownItem;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryBreakdownCalculator;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntryTreeBuilder;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RecipeGraphDiaryEntryTreeBuilder implements DiaryEntryTreeBuilder
{
    public function __construct(
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private DiaryBreakdownCalculator $calculator,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function materialize(string $diaryEntryId, string $recipeId, float $servings, array $existingNodes, string $userId): array
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
            $nodes[] = $this->toNode(diaryEntryId: $diaryEntryId, item: $item, existing: $existing, userId: $userId);
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
            static fn (DiaryEntryNode $node): DiaryBreakdownItem => new DiaryBreakdownItem(
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
                macros: $node->macros(),
            ),
            $ordered,
        );

        $refreshed = $this->calculator->refresh(graph: $this->graphProvider->load(), items: $items);

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
    private function toNode(string $diaryEntryId, DiaryBreakdownItem $item, array $existing, string $userId): DiaryEntryNode
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

    private static function parentPathOf(DiaryEntryNode $node): ?string
    {
        $separator = strrpos(haystack: $node->path, needle: DiaryEntryNode::PATH_SEPARATOR);

        return false === $separator ? null : substr(string: $node->path, offset: 0, length: $separator);
    }
}
