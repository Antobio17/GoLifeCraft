<?php

namespace Nutrition\GlobalCatalog\Article\Domain\Model;

final readonly class GlobalArticleNutrition
{
    public function __construct(
        public float $referenceAmount,
        public ?float $calories = null,
        public ?float $protein = null,
        public ?float $carbs = null,
        public ?float $sugars = null,
        public ?float $fat = null,
        public ?float $saturatedFat = null,
        public ?float $fiber = null,
        public ?float $salt = null,
    ) {
    }
}
