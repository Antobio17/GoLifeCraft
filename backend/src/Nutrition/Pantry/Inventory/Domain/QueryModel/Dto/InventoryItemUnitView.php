<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel\Dto;

final readonly class InventoryItemUnitView
{
    public function __construct(
        public string $unit,
        public float $factor,
    ) {
    }
}
