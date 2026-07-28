<?php

namespace Nutrition\Menu\Menu\Domain\Model;

final class MenuWeekDay
{
    public const MONDAY = 'mon';
    public const TUESDAY = 'tue';
    public const WEDNESDAY = 'wed';
    public const THURSDAY = 'thu';
    public const FRIDAY = 'fri';
    public const SATURDAY = 'sat';
    public const SUNDAY = 'sun';

    /** @var array<int, string> */
    public const KEYS = [
        self::MONDAY,
        self::TUESDAY,
        self::WEDNESDAY,
        self::THURSDAY,
        self::FRIDAY,
        self::SATURDAY,
        self::SUNDAY,
    ];

    public static function isValid(string $dayKey): bool
    {
        return in_array(needle: $dayKey, haystack: self::KEYS, strict: true);
    }

    public static function offset(string $dayKey): int
    {
        $offset = array_search(needle: $dayKey, haystack: self::KEYS, strict: true);

        return false === $offset ? 0 : $offset;
    }

    /**
     * @param array<int, string> $dayKeys
     *
     * @return array<int, string>
     */
    public static function sort(array $dayKeys): array
    {
        $sorted = array_values(array: array_unique(array: array_filter(
            array: $dayKeys,
            callback: static fn (string $dayKey): bool => self::isValid(dayKey: $dayKey),
        )));

        usort($sorted, static fn (string $a, string $b): int => self::offset(dayKey: $a) <=> self::offset(dayKey: $b));

        return $sorted;
    }
}
