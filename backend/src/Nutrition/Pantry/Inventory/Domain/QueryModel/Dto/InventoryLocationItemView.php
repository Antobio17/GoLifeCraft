<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel\Dto;

final readonly class InventoryLocationItemView
{
    /**
     * @param InventoryItemUnitView[] $units
     */
    public function __construct(
        public string $id,
        public int $position,
        public string $kind,
        public string $refId,
        public string $name,
        public string $emoji,
        public ?string $image,
        public string $unit,
        public array $units,
        public float $expectedQuantity,
        public ?float $countedQuantity,
        public ?string $countedUnit,
        public float $difference,
    ) {
    }
}
