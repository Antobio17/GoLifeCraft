<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

/**
 * One article a batch consumes, with the recipe's own unit for the cooking checklist and the
 * article's base unit for the pantry, which only ever counts in "g"/"ml".
 */
final readonly class ProductionIngredient
{
    public const int QUANTITY_PRECISION = 4;

    public function __construct(
        public string $articleId,
        public string $name,
        public string $emoji,
        public float $quantity,
        public string $unit,
        public float $baseQuantity,
        public string $baseUnit,
    ) {
    }
}
