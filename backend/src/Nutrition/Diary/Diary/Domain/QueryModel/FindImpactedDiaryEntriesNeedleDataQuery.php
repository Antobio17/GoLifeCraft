<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

interface FindImpactedDiaryEntriesNeedleDataQuery
{
    /**
     * Ids of today's diary entries impacted by a change to the given article/recipe: entries
     * that reference it directly, plus entries referencing a recipe that transitively contains it.
     *
     * @return array<int, string>
     */
    public function findTodayImpactedEntryIds(string $changedRefId): array;

    /**
     * Ids of today's diary entries impacted by a change to a nutrition facts row: resolves the
     * articles pointing at it, then applies the same impact rules as findTodayImpactedEntryIds.
     *
     * @return array<int, string>
     */
    public function findTodayImpactedEntryIdsForNutritionFacts(string $nutritionFactsId): array;
}
