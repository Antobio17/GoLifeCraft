<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Model\MenuItem;

final readonly class MenuItemData
{
    public function __construct(
        public ?string $dayKey,
        public string $meal,
        public string $kind,
        public string $refId,
        public float $quantity,
        public int $position,
        public ?string $unit = null,
        public ?string $id = null,
    ) {
    }

    public static function fromArray(array $rawItem, int $position): self
    {
        return new self(
            dayKey: self::normalizeNullableString(value: $rawItem['dayKey'] ?? null),
            meal: (string) ($rawItem['meal'] ?? MenuItem::MEAL_BREAKFAST),
            kind: self::normalizeKind(kind: (string) ($rawItem['kind'] ?? MenuItem::KIND_PRODUCT)),
            refId: (string) ($rawItem['refId'] ?? ''),
            quantity: (float) ($rawItem['quantity'] ?? $rawItem['qty'] ?? 0),
            position: (int) ($rawItem['position'] ?? $position),
            unit: self::normalizeNullableString(value: $rawItem['unit'] ?? null),
            id: self::normalizeNullableString(value: $rawItem['id'] ?? null),
        );
    }

    /**
     * @return self[]
     */
    public static function listFromArray(array $rawItems): array
    {
        $items = [];

        foreach (array_values(array: $rawItems) as $index => $rawItem) {
            $items[] = self::fromArray(rawItem: $rawItem, position: $index + 1);
        }

        return $items;
    }

    private static function normalizeKind(string $kind): string
    {
        return MenuItem::KIND_RECIPE === $kind
            ? MenuItem::KIND_RECIPE
            : MenuItem::KIND_PRODUCT;
    }

    private static function normalizeNullableString(mixed $value): ?string
    {
        $value = trim(string: (string) ($value ?? ''));

        return '' === $value ? null : $value;
    }
}
