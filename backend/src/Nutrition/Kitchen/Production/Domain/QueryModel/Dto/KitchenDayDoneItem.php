<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class KitchenDayDoneItem
{
    public function __construct(
        public string $productionId,
        public string $recipeId,
        public string $name,
        public string $emoji,
        public float $servingsCooked,
        public string $cookedAt,
    ) {
    }
}
