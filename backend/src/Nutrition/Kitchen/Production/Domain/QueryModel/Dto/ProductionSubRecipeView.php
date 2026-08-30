<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProductionSubRecipeView
{
    public function __construct(
        public string $recipeId,
        public string $name,
        public string $emoji,
        public float $servings,
        public float $inStock,
        public ?string $sourceProductionItemId = null,
        public ?string $lotCode = null,
        public string $lotLabel = '',
    ) {
    }
}
