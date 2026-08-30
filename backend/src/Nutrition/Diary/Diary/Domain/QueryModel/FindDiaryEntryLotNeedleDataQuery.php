<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel;

interface FindDiaryEntryLotNeedleDataQuery
{
    /**
     * Oldest cooked batch of a recipe with servings still free on the given day, so a plate eats
     * what has been in the fridge or the freezer the longest. Null when there is nothing cooked.
     */
    public function findLotWithRoom(string $recipeId, string $entryDate, float $servings): ?string;

    /**
     * Entries that can still be served from a batch cooked on the given day: the recipe matches,
     * the day is not earlier than the cooking, nothing was eaten yet and no batch was picked.
     * Oldest first, and only as many as the batch can feed.
     *
     * @return array<int, string>
     */
    public function findEntriesToAttach(string $recipeId, string $cookedOn, float $servings): array;

    /**
     * @return array<int, string>
     */
    public function findEntriesOfLot(string $productionItemId): array;
}
