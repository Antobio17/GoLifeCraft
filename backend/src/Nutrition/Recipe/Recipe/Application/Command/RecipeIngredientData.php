<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;

final readonly class RecipeIngredientData
{
    public function __construct(
        public string $kind,
        public string $refId,
        public float $quantity,
        public int $position,
        public ?string $unit = null,
    ) {
    }

    public static function fromArray(array $rawIngredient, int $position): self
    {
        return new self(
            kind: self::normalizeKind(kind: (string) ($rawIngredient['kind'] ?? RecipeIngredient::KIND_PRODUCT)),
            refId: (string) ($rawIngredient['refId'] ?? ''),
            quantity: (float) ($rawIngredient['quantity'] ?? $rawIngredient['qty'] ?? 0),
            unit: self::normalizeUnit(unit: $rawIngredient['unit'] ?? null),
            position: (int) ($rawIngredient['position'] ?? $position),
        );
    }

    /**
     * @return self[]
     */
    public static function listFromArray(array $rawIngredients): array
    {
        $ingredients = [];

        foreach (array_values(array: $rawIngredients) as $index => $rawIngredient) {
            $ingredients[] = self::fromArray(rawIngredient: $rawIngredient, position: $index + 1);
        }

        return $ingredients;
    }

    private static function normalizeKind(string $kind): string
    {
        return RecipeIngredient::KIND_RECIPE === $kind
            ? RecipeIngredient::KIND_RECIPE
            : RecipeIngredient::KIND_PRODUCT;
    }

    private static function normalizeUnit(mixed $unit): ?string
    {
        $unit = trim(string: (string) ($unit ?? ''));

        return '' === $unit ? null : $unit;
    }
}
