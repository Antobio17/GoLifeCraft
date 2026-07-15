<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

final readonly class DiaryGoals
{
    public function __construct(
        public float $calories,
        public float $protein,
        public float $fat,
        public float $carbs,
    ) {
    }

    public static function default(): self
    {
        return new self(calories: 2100.0, protein: 130.0, fat: 70.0, carbs: 250.0);
    }
}
