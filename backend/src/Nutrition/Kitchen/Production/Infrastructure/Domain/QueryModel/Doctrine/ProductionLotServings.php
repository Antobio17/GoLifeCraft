<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

/**
 * How much of a cooked batch is already spoken for: what the diary eats from it plus what other
 * batches took from it as a sub-recipe. It lives in one place so the kitchen and the diary can
 * never disagree on the room a batch has left.
 */
final class ProductionLotServings
{
    public static function assigned(string $itemAlias): string
    {
        return sprintf(
            '(SELECT COALESCE(SUM(d.quantity), 0) FROM diary_entry d WHERE d.production_item_id = %1$s.id)'
            .' + (SELECT COALESCE(SUM(c.quantity), 0) FROM production_item_consumption c WHERE c.source_production_item_id = %1$s.id)',
            $itemAlias,
        );
    }

    public static function free(string $itemAlias): string
    {
        return sprintf('%s.servings_cooked - (%s)', $itemAlias, self::assigned(itemAlias: $itemAlias));
    }
}
