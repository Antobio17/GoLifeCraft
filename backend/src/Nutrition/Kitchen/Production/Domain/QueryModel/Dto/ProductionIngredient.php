<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProductionIngredient
{
    public const int QUANTITY_PRECISION = 4;

    public function __construct(
        public string $articleId,
        public string $name,
        public string $emoji,
        public ?string $image,
        public float $quantity,
        public string $unit,
        public float $baseQuantity,
        public string $baseUnit,
    ) {
    }
}
