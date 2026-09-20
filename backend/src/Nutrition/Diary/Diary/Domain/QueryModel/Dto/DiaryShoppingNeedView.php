<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

final readonly class DiaryShoppingNeedView
{
    public function __construct(
        public string $articleId,
        public string $name,
        public string $emoji,
        public ?string $image,
        public ?string $brand,
        public ?string $store,
        public ?float $price,
        public float $quantity,
        public float $stockQuantity,
        public float $missingQuantity,
        public string $baseUnit,
        public ?string $packUnit,
        public ?float $packSize,
        public ?int $packs,
        public bool $inShoppingList,
        public string $trackingMode,
        public float $stockConfidence,
        public ?float $stockMinQuantity,
        public ?float $stockMaxQuantity,
        public string $stockLevel,
        public string $sufficiency,
        public float $safeMissingQuantity,
        public ?int $safePacks,
    ) {
    }
}
