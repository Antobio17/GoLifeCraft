<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

interface FindDiaryEntryLotNeedleDataQuery
{
    public function findLotWithRoom(string $recipeId, string $entryDate, float $servings): ?string;

    /**
     * @return array<int, string>
     */
    public function findEntriesToAttach(string $recipeId, string $cookedOn, float $servings): array;

    /**
     * @return array<int, string>
     */
    public function findEntriesOfLot(string $productionItemId): array;
}
