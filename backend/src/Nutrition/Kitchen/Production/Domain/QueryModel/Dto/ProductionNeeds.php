<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProductionNeeds
{
    /**
     * @param ProductionIngredient[] $articles
     * @param ProductionSubRecipe[]  $subRecipes
     */
    public function __construct(
        public array $articles,
        public array $subRecipes,
    ) {
    }
}
