<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel\Dto;

final readonly class MacroBreakdown
{
    public function __construct(
        public float $calories,
        public float $protein,
        public float $fat,
        public float $carbs,
    ) {
    }

    public static function zero(): self
    {
        return new self(calories: 0.0, protein: 0.0, fat: 0.0, carbs: 0.0);
    }

    public function add(self $other): self
    {
        return new self(
            calories: $this->calories + $other->calories,
            protein: $this->protein + $other->protein,
            fat: $this->fat + $other->fat,
            carbs: $this->carbs + $other->carbs,
        );
    }

    public function scale(float $factor): self
    {
        return new self(
            calories: $this->calories * $factor,
            protein: $this->protein * $factor,
            fat: $this->fat * $factor,
            carbs: $this->carbs * $factor,
        );
    }

    public function rounded(): self
    {
        return new self(
            calories: round(num: $this->calories, precision: 1),
            protein: round(num: $this->protein, precision: 1),
            fat: round(num: $this->fat, precision: 1),
            carbs: round(num: $this->carbs, precision: 1),
        );
    }
}
