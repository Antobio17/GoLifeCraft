<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProductionIngredientView
{
    public function __construct(
        public string $articleId,
        public string $name,
        public string $emoji,
        public float $quantity,
        public string $unit,
    ) {
    }
}
