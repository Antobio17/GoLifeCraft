<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

interface FindImpactedDiaryEntriesNeedleDataQuery
{
    /**
     * Ids of the diary entries from today onwards impacted by a change to the given article/recipe:
     * entries that reference it directly, plus entries referencing a recipe that transitively
     * contains it. Past days keep the macros they were closed with.
     *
     * @return array<int, string>
     */
    public function findUpcomingImpactedEntryIds(string $changedRefId): array;

    /**
     * Ids of the diary entries from today onwards impacted by a change to a nutrition facts row:
     * resolves the articles pointing at it, then applies the same impact rules as
     * findUpcomingImpactedEntryIds.
     *
     * @return array<int, string>
     */
    public function findUpcomingImpactedEntryIdsForNutritionFacts(string $nutritionFactsId): array;
}
