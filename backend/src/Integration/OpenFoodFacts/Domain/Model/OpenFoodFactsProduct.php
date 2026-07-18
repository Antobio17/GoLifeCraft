<?php

namespace Integration\OpenFoodFacts\Domain\Model;

final readonly class OpenFoodFactsProduct
{
    public function __construct(
        public string $barcode,
        public string $name,
        public ?string $brand,
        public ?string $categoryName,
        public ?string $imageUrl,
        public ?string $quantity,
        public ?string $stores,
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

    public static function fromApiData(array $data): ?self
    {
        $barcode = self::toTrimmedString(value: $data['code'] ?? null);
        $name = self::toTrimmedString(value: $data['product_name'] ?? null);

        if (null === $barcode || null === $name) {
            return null;
        }

        $nutriments = is_array($data['nutriments'] ?? null) ? $data['nutriments'] : [];

        return new self(
            barcode: $barcode,
            name: $name,
            brand: self::firstOfList(value: $data['brands'] ?? null),
            categoryName: self::lastOfList(value: $data['categories'] ?? null),
            imageUrl: self::toTrimmedString(value: $data['image_url'] ?? null),
            quantity: self::toTrimmedString(value: $data['quantity'] ?? null),
            stores: self::toTrimmedString(value: $data['stores'] ?? null),
            referenceAmount: 100.0,
            calories: self::toFloat(value: $nutriments['energy-kcal_100g'] ?? null),
            protein: self::toFloat(value: $nutriments['proteins_100g'] ?? null),
            carbs: self::toFloat(value: $nutriments['carbohydrates_100g'] ?? null),
            sugars: self::toFloat(value: $nutriments['sugars_100g'] ?? null),
            fat: self::toFloat(value: $nutriments['fat_100g'] ?? null),
            saturatedFat: self::toFloat(value: $nutriments['saturated-fat_100g'] ?? null),
            fiber: self::toFloat(value: $nutriments['fiber_100g'] ?? null),
            salt: self::toFloat(value: $nutriments['salt_100g'] ?? null),
        );
    }

    private static function toTrimmedString(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return '' === $trimmed ? null : $trimmed;
    }

    private static function firstOfList(mixed $value): ?string
    {
        $list = self::splitList(value: $value);

        return $list[0] ?? null;
    }

    private static function lastOfList(mixed $value): ?string
    {
        $list = self::splitList(value: $value);

        return empty($list) ? null : end($list);
    }

    /** @return string[] */
    private static function splitList(mixed $value): array
    {
        if (!is_string($value) || '' === trim($value)) {
            return [];
        }

        return array_values(array_filter(array_map('trim', explode(',', $value)), static fn (string $item): bool => '' !== $item));
    }

    private static function toFloat(mixed $value): ?float
    {
        if (null === $value || '' === $value || !is_numeric($value)) {
            return null;
        }

        return (float) $value;
    }
}
