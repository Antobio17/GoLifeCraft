<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProductionRecipeSnapshot
{
    public function __construct(
        public string $recipeId,
        public string $name,
        public string $emoji,
        public int $servings,
    ) {
    }
}
