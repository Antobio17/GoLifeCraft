<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel\Dto;

final readonly class InventoryLocationPlan
{
    /**
     * @param InventoryStockLine[] $items
     */
    public function __construct(
        public string $locationId,
        public string $name,
        public string $emoji,
        public array $items,
    ) {
    }
}
