<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel\Dto;

final readonly class InventoryStockLine
{
    public function __construct(
        public string $kind,
        public string $refId,
        public ?string $locationId,
        public string $name,
        public string $emoji,
        public string $unit,
        public float $quantity,
    ) {
    }
}
