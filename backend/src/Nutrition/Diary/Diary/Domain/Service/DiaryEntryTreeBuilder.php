<?php

namespace Nutrition\Diary\Diary\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

interface DiaryEntryTreeBuilder
{
    /**
     * The breakdown of a recipe entry. With a batch given, it is built from what that batch
     * actually went in with instead of from the recipe; an unknown batch falls back to the recipe.
     *
     * @param DiaryEntryNode[] $existingNodes
     *
     * @return DiaryEntryNode[]
     */
    public function materialize(string $diaryEntryId, string $recipeId, float $servings, array $existingNodes, string $userId, ?string $productionItemId = null): array;

    /**
     * Everything that hangs under one sub-recipe node, rebuilt from the batch pinned to it, or from
     * its recipe when there is none. The rest of the breakdown is left alone.
     *
     * @param DiaryEntryNode[] $existingNodes
     *
     * @return DiaryEntryNode[]
     */
    public function materializeSubtree(DiaryEntryNode $node, array $existingNodes, string $userId): array;

    /**
     * @param array<int, array<string, mixed>> $tree
     *
     * @return DiaryEntryNode[]
     */
    public function fromPayload(string $diaryEntryId, array $tree, string $userId): array;

    /** @param DiaryEntryNode[] $nodes */
    public function refresh(array $nodes): MacroBreakdown;
}
