<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

/**
 * What cooking a recipe consumes directly: its own articles and the servings of the recipes it
 * uses as ingredients. Never the articles of those, which belong to their own production.
 */
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
