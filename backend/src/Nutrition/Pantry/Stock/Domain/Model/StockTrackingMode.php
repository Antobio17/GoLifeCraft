<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

enum StockTrackingMode: string
{
    case EXACT = 'exact';
    case APPROXIMATE = 'approximate';
    case NONE = 'none';

    public static function fromValue(?string $value): self
    {
        return self::tryFrom(value: (string) $value) ?? self::APPROXIMATE;
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(
            callback: static fn (self $mode): string => $mode->value,
            array: self::cases(),
        );
    }
}
