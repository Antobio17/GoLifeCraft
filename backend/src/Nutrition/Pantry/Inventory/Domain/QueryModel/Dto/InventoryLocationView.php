<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel\Dto;

final readonly class InventoryLocationView
{
    /**
     * @param InventoryLocationItemView[] $items
     */
    public function __construct(
        public string $id,
        public int $position,
        public ?string $locationId,
        public string $name,
        public string $emoji,
        public int $totalItems,
        public int $countedItems,
        public int $adjustedItems,
        public array $items,
    ) {
    }
}
