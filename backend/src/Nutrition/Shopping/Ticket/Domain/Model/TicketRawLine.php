<?php

namespace Nutrition\Shopping\Ticket\Domain\Model;

use Nutrition\Shopping\Ticket\Domain\Exception\AddTicketLinesException;

final readonly class TicketRawLine
{
    public function __construct(
        public string $rawName,
        public float $quantity,
        public ?string $rawUnit,
        public ?float $unitPrice,
        public ?float $totalPrice,
    ) {
    }

    /**
     * @param array<string, mixed> $line
     */
    public static function fromArray(array $line): self
    {
        $rawName = trim(string: (string) ($line['rawName'] ?? $line['name'] ?? ''));

        if ('' === $rawName) {
            throw AddTicketLinesException::lineWithoutName();
        }

        $quantity = (float) ($line['quantity'] ?? 1.0);

        if ($quantity <= 0.0) {
            throw AddTicketLinesException::lineWithoutQuantity(rawName: $rawName);
        }

        return new self(
            rawName: mb_substr(string: $rawName, start: 0, length: TicketItem::RAW_NAME_MAX_LENGTH),
            quantity: $quantity,
            rawUnit: self::nullableString(value: $line['unit'] ?? $line['rawUnit'] ?? null),
            unitPrice: self::nullableFloat(value: $line['unitPrice'] ?? null),
            totalPrice: self::nullableFloat(value: $line['totalPrice'] ?? $line['total'] ?? null),
        );
    }

    private static function nullableString(mixed $value): ?string
    {
        if (null === $value || '' === trim(string: (string) $value)) {
            return null;
        }

        return trim(string: (string) $value);
    }

    private static function nullableFloat(mixed $value): ?float
    {
        return null === $value || '' === $value ? null : (float) $value;
    }
}
