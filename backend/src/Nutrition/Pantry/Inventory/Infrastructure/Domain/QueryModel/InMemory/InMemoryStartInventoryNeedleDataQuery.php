<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryLocationPlan;
use Nutrition\Pantry\Inventory\Domain\QueryModel\StartInventoryNeedleDataQuery;

final class InMemoryStartInventoryNeedleDataQuery implements StartInventoryNeedleDataQuery
{
    /**
     * @param InventoryLocationPlan[] $locationPlans
     */
    public function __construct(
        private array $locationPlans = [],
        private ?string $openInventoryId = null,
    ) {
    }

    public function openInventoryId(): ?string
    {
        return $this->openInventoryId;
    }

    public function findLocationPlans(): array
    {
        return $this->locationPlans;
    }
}
