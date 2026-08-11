<?php

namespace Nutrition\Diary\Diary\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

interface DiaryEntryTreeBuilder
{
    /**
     * @param DiaryEntryNode[] $existingNodes
     *
     * @return DiaryEntryNode[]
     */
    public function materialize(string $diaryEntryId, string $recipeId, float $servings, array $existingNodes, string $userId): array;

    /** @param DiaryEntryNode[] $nodes */
    public function refresh(array $nodes): MacroBreakdown;
}
