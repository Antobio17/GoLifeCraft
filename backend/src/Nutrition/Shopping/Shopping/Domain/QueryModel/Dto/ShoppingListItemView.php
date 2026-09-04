<?php

namespace Nutrition\Shopping\Shopping\Domain\QueryModel\Dto;

final readonly class ShoppingListItemView
{
    public function __construct(
        public string $id,
        public ?string $articleId,
        public bool $custom,
        public string $name,
        public string $emoji,
        public ?string $image,
        public ?string $brand,
        public ?string $store,
        public string $category,
        public ?string $aisle,
        public ?int $aislePosition,
        public ?float $unitPrice,
        public int $quantity,
        public ?string $packUnit,
        public ?float $packSize,
        public string $baseUnit,
        public ?float $baseQuantity,
        public bool $checked,
        public float $lineTotal,
    ) {
    }
}
