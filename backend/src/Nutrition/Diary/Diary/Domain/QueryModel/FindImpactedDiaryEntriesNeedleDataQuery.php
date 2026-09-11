<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

interface FindImpactedDiaryEntriesNeedleDataQuery
{
    /**
     * @return array<int, string>
     */
    public function findUpcomingImpactedEntryIds(string $changedRefId): array;

    /**
     * @return array<int, string>
     */
    public function findUpcomingImpactedEntryIdsForNutritionFacts(string $nutritionFactsId): array;
}
