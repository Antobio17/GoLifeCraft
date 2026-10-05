<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Inventory\Domain\QueryModel\CountInventoryItemNeedleDataQuery;

final class InMemoryCountInventoryItemNeedleDataQuery implements CountInventoryItemNeedleDataQuery
{
    /** @var array<string, array<string, float>> */
    private array $factors = [];

    public function withFactor(string $articleId, string $unit, float $factor): void
    {
        $this->factors[$articleId][$unit] = $factor;
    }

    public function withBaseUnit(string $articleId, string $unit): void
    {
        $this->factors[$articleId][$unit] = 1.0;
    }

    public function baseUnitFactor(string $articleId, string $unit): ?float
    {
        return $this->factors[$articleId][$unit] ?? null;
    }
}
