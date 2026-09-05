<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryStockLine;
use Nutrition\Pantry\Inventory\Domain\QueryModel\StartInventoryNeedleDataQuery;

final class InMemoryStartInventoryNeedleDataQuery implements StartInventoryNeedleDataQuery
{
    /**
     * @param InventoryStockLine[] $stockLines
     * @param string[]             $locationIds
     */
    public function __construct(
        private array $stockLines = [],
        private array $locationIds = [],
        private ?string $openInventoryId = null,
    ) {
    }

    public function openInventoryId(): ?string
    {
        return $this->openInventoryId;
    }

    public function locationExists(string $locationId): bool
    {
        return in_array(needle: $locationId, haystack: $this->locationIds, strict: true);
    }

    public function findStockLines(?string $locationId): array
    {
        if (null === $locationId) {
            return $this->stockLines;
        }

        return array_values(array: array_filter(
            array: $this->stockLines,
            callback: static fn (InventoryStockLine $line): bool => $line->locationId === $locationId,
        ));
    }
}
