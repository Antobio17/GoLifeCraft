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

    public function baseUnitFactor(string $articleId, string $unit): ?float
    {
        return $this->factors[$articleId][$unit] ?? null;
    }
}
