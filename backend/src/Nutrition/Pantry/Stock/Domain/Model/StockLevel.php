<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

enum StockLevel: string
{
    case UNKNOWN = 'unknown';
    case EMPTY_LEVEL = 'empty';
    case LOW = 'low';
    case MEDIUM = 'medium';
    case HIGH = 'high';
    case FULL = 'full';

    private const float EMPTY_BELOW = 0.02;
    private const float LOW_BELOW = 0.30;
    private const float MEDIUM_BELOW = 0.65;
    private const float HIGH_BELOW = 1.0;

    public static function of(float $quantity, ?float $packSize): self
    {
        if (null === $packSize || $packSize <= 0.0) {
            return self::UNKNOWN;
        }

        $ratio = $quantity / $packSize;

        return match (true) {
            $ratio < self::EMPTY_BELOW => self::EMPTY_LEVEL,
            $ratio < self::LOW_BELOW => self::LOW,
            $ratio < self::MEDIUM_BELOW => self::MEDIUM,
            $ratio < self::HIGH_BELOW => self::HIGH,
            default => self::FULL,
        };
    }
}
