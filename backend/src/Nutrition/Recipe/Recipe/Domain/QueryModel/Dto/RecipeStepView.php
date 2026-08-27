<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel\Dto;

final readonly class RecipeStepView
{
    public function __construct(
        public string $id,
        public int $position,
        public string $text,
        public ?int $minutes,
    ) {
    }
}
