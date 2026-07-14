<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel\Dto;

final readonly class RecipeIngredientView
{
    public function __construct(
        public string $id,
        public string $kind,
        public string $refId,
        public string $name,
        public string $emoji,
        public float $quantity,
        public string $unit,
        public int $position,
        public MacroBreakdown $macros,
    ) {
    }
}
