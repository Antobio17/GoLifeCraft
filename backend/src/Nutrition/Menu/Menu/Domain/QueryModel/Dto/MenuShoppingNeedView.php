<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

final readonly class MenuShoppingNeedView
{
    public function __construct(
        public string $articleId,
        public string $name,
        public string $emoji,
        public ?string $image,
        public ?string $brand,
        public ?string $store,
        public float $quantity,
        public string $baseUnit,
        public ?string $packUnit,
        public ?float $packSize,
        public int $packs,
        public bool $inShoppingList,
    ) {
    }
}
