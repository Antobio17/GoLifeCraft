<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

final readonly class MenuShoppingNeedView
{
    public function __construct(
        public string $articleId,
        public string $name,
        public string $emoji,
        public ?string $brand,
        public ?string $store,
        public float $quantity,
        public string $baseUnit,
        public bool $inShoppingList,
    ) {
    }
}
