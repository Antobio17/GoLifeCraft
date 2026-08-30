<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Diary\Diary\Domain\QueryModel\FindDiaryEntryLotNeedleDataQuery;

final class InMemoryFindDiaryEntryLotNeedleDataQuery implements FindDiaryEntryLotNeedleDataQuery
{
    /** @var array<string, array{productionItemId: string, cookedOn: string, servingsLeft: float}> */
    private array $lots = [];

    /** @var array<string, array<int, string>> */
    private array $entriesByLot = [];

    /** @var array<int, string> */
    private array $entriesToAttach = [];

    public function withLot(string $productionItemId, string $recipeId, string $cookedOn, float $servingsLeft): self
    {
        $this->lots[$recipeId] = [
            'productionItemId' => $productionItemId,
            'cookedOn' => $cookedOn,
            'servingsLeft' => $servingsLeft,
        ];

        return $this;
    }

    /**
     * @param array<int, string> $entryIds
     */
    public function withEntriesOfLot(string $productionItemId, array $entryIds): self
    {
        $this->entriesByLot[$productionItemId] = $entryIds;

        return $this;
    }

    /**
     * @param array<int, string> $entryIds
     */
    public function withEntriesToAttach(array $entryIds): self
    {
        $this->entriesToAttach = $entryIds;

        return $this;
    }

    public function findLotWithRoom(string $recipeId, string $entryDate, float $servings): ?string
    {
        $lot = $this->lots[$recipeId] ?? null;

        if (null === $lot || $lot['cookedOn'] > $entryDate || $lot['servingsLeft'] < $servings) {
            return null;
        }

        return $lot['productionItemId'];
    }

    public function findEntriesToAttach(string $recipeId, string $cookedOn, float $servings): array
    {
        return $this->entriesToAttach;
    }

    public function findEntriesOfLot(string $productionItemId): array
    {
        return $this->entriesByLot[$productionItemId] ?? [];
    }
}
