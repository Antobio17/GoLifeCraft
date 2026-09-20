<?php

namespace Nutrition\Pantry\Movement\Domain\Model;

enum StockLevel: string
{
    case UNKNOWN = 'unknown';
    case EMPTY_LEVEL = 'empty';
    case LOW = 'low';
    case MEDIUM = 'medium';
    case HIGH = 'high';
    case FULL = 'full';

    private const float EMPTY_BELOW = 0.02;
    private const float LOW_BELOW = 0.25;
    private const float MEDIUM_BELOW = 0.65;
    private const float HIGH_BELOW = 1.0;

    /**
     * @return array<int, string>
     */
    public static function statedValues(): array
    {
        return [
            self::EMPTY_LEVEL->value,
            self::LOW->value,
            self::MEDIUM->value,
            self::HIGH->value,
            self::FULL->value,
        ];
    }

    public static function of(float $quantity, ?float $referenceQuantity): self
    {
        if (null === $referenceQuantity || $referenceQuantity <= 0.0) {
            return self::UNKNOWN;
        }

        $ratio = $quantity / $referenceQuantity;

        return match (true) {
            $ratio < self::EMPTY_BELOW => self::EMPTY_LEVEL,
            $ratio < self::LOW_BELOW => self::LOW,
            $ratio < self::MEDIUM_BELOW => self::MEDIUM,
            $ratio < self::HIGH_BELOW => self::HIGH,
            default => self::FULL,
        };
    }

    public function fractionOfReference(): float
    {
        return match ($this) {
            self::UNKNOWN, self::EMPTY_LEVEL => 0.0,
            self::LOW => 0.20,
            self::MEDIUM => 0.50,
            self::HIGH => 0.80,
            self::FULL => 1.0,
        };
    }

    public function needsReference(): bool
    {
        return self::EMPTY_LEVEL !== $this && self::UNKNOWN !== $this;
    }
}
