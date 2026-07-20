<?php

namespace Nutrition\Shopping\Shopping\Domain\QueryModel\Dto;

final readonly class ShoppingListItemView
{
    public function __construct(
        public string $id,
        public string $articleId,
        public string $name,
        public string $emoji,
        public ?string $brand,
        public ?string $store,
        public string $category,
        public ?float $unitPrice,
        public int $quantity,
        public bool $checked,
        public float $lineTotal,
    ) {
    }
}
