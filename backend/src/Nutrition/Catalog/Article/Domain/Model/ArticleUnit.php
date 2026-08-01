<?php

namespace Nutrition\Catalog\Article\Domain\Model;

enum ArticleUnit: string
{
    case UNIT = 'unit';
    case SLICE = 'slice';
    case BREAD_SLICE = 'bread_slice';
    case GLASS = 'glass';
    case SERVING = 'serving';
    case PIECE = 'piece';
    case CAN = 'can';
    case JAR = 'jar';
    case BAG = 'bag';
    case CARTON = 'carton';
    case CONTAINER = 'container';
    case TABLESPOON = 'tablespoon';
    case PACK = 'pack';
    case HANDFUL = 'handful';

    /**
     * @return string[]
     */
    public static function values(): array
    {
        return array_map(
            callback: static fn (self $unit): string => $unit->value,
            array: self::cases(),
        );
    }

    public static function isAlias(string $unit): bool
    {
        return null !== self::tryFrom($unit);
    }
}
