<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel\Dto;

final readonly class InventoryLocationItemView
{
    public function __construct(
        public string $id,
        public int $position,
        public string $kind,
        public string $refId,
        public string $name,
        public string $emoji,
        public string $unit,
        public float $expectedQuantity,
        public ?float $countedQuantity,
        public float $difference,
    ) {
    }
}
