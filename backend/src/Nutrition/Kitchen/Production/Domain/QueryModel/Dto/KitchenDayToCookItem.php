<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class KitchenDayToCookItem
{
    public function __construct(
        public string $recipeId,
        public string $name,
        public string $emoji,
        public float $demand,
        public float $inStock,
        public float $deficit,
        public ?KitchenDayPackHint $packHint,
    ) {
    }
}
