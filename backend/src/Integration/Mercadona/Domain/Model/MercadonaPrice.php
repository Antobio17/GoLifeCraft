<?php

namespace Integration\Mercadona\Domain\Model;

final readonly class MercadonaPrice
{
    public function __construct(
        public ?float $unitPrice = null,
        public ?float $bulkPrice = null,
        public ?float $referencePrice = null,
        public ?string $referenceFormat = null,
        public ?float $previousUnitPrice = null,
    ) {
    }

    public static function fromPriceInstructions(mixed $priceInstructions): self
    {
        if (!is_array($priceInstructions)) {
            return new self();
        }

        return new self(
            unitPrice: self::toFloat(value: $priceInstructions['unit_price'] ?? null),
            bulkPrice: self::toFloat(value: $priceInstructions['bulk_price'] ?? null),
            referencePrice: self::toFloat(value: $priceInstructions['reference_price'] ?? null),
            referenceFormat: self::toTrimmedString(value: $priceInstructions['reference_format'] ?? null),
            previousUnitPrice: self::toFloat(value: $priceInstructions['previous_unit_price'] ?? null),
        );
    }

    private static function toFloat(mixed $value): ?float
    {
        if (is_string($value)) {
            $value = trim($value);
        }

        if (!is_numeric($value)) {
            return null;
        }

        return (float) $value;
    }

    private static function toTrimmedString(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return '' === $trimmed ? null : $trimmed;
    }
}
