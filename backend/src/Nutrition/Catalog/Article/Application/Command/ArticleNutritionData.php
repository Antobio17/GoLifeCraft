<?php

namespace Nutrition\Catalog\Article\Application\Command;

final readonly class ArticleNutritionData
{
    public function __construct(
        public float $referenceAmount,
        public ?float $calories,
        public ?float $protein,
        public ?float $carbs,
        public ?float $sugars,
        public ?float $fat,
        public ?float $saturatedFat,
        public ?float $fiber,
        public ?float $salt,
    ) {
    }

    public static function fromArray(array $rawNutrition): self
    {
        return new self(
            referenceAmount: self::toFloat(value: $rawNutrition['referenceAmount'] ?? null) ?? 100.0,
            calories: self::toFloat(value: $rawNutrition['calories'] ?? null),
            protein: self::toFloat(value: $rawNutrition['protein'] ?? null),
            carbs: self::toFloat(value: $rawNutrition['carbs'] ?? null),
            sugars: self::toFloat(value: $rawNutrition['sugars'] ?? null),
            fat: self::toFloat(value: $rawNutrition['fat'] ?? null),
            saturatedFat: self::toFloat(value: $rawNutrition['saturatedFat'] ?? null),
            fiber: self::toFloat(value: $rawNutrition['fiber'] ?? null),
            salt: self::toFloat(value: $rawNutrition['salt'] ?? null),
        );
    }

    private static function toFloat(mixed $value): ?float
    {
        if (null === $value || '' === $value || !is_numeric(value: $value)) {
            return null;
        }

        return (float) $value;
    }
}
