<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\Service\InMemory;

use Nutrition\Kitchen\Production\Domain\Service\ProductionLotAllocator;

final class InMemoryProductionLotAllocator implements ProductionLotAllocator
{
    /** @var array<string, array{productionItemId: string, cookedOn: string, servingsLeft: float}> */
    private array $lots = [];

    public function withLot(string $recipeId, string $productionItemId, float $servingsLeft, string $cookedOn = ''): self
    {
        $this->lots[$recipeId] = [
            'productionItemId' => $productionItemId,
            'cookedOn' => $cookedOn,
            'servingsLeft' => $servingsLeft,
        ];

        return $this;
    }

    public function findLotWithRoom(string $recipeId, float $servings, ?string $cookedOnOrBefore = null): ?string
    {
        $lot = $this->lots[$recipeId] ?? null;

        if (null === $lot || $lot['servingsLeft'] < $servings) {
            return null;
        }

        if (null !== $cookedOnOrBefore && $lot['cookedOn'] > $cookedOnOrBefore) {
            return null;
        }

        return $lot['productionItemId'];
    }
}
