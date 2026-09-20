<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

enum StockTrackingMode: string
{
    case EXACT = 'exact';
    case APPROXIMATE = 'approximate';
    case NONE = 'none';

    public static function default(): self
    {
        return self::APPROXIMATE;
    }

    public static function fromValue(?string $value): self
    {
        return null !== $value ? self::from(value: $value) : self::default();
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

    public function isTracked(): bool
    {
        return self::NONE !== $this;
    }

    public function toleratesDrift(): bool
    {
        return self::APPROXIMATE === $this;
    }
}
