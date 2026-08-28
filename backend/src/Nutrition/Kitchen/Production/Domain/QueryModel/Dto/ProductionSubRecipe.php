<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

/**
 * A recipe used as an ingredient of another one. It is consumed from its own servings balance the
 * same way an article is consumed from the pantry: whoever cooks the sub-recipe is the one who
 * spends its raw materials.
 */
final readonly class ProductionSubRecipe
{
    public function __construct(
        public string $recipeId,
        public string $name,
        public string $emoji,
        public float $servings,
    ) {
    }
}
