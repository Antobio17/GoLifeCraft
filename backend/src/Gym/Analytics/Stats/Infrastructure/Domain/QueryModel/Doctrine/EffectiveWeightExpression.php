<?php

namespace Gym\Analytics\Stats\Infrastructure\Domain\QueryModel\Doctrine;

final class EffectiveWeightExpression
{
    public const string PER_SIDE_WEIGHT_MODE = 'perSide';
    public const int PER_SIDE_FACTOR = 2;

    public static function sql(string $setAlias, string $exerciseAlias): string
    {
        return sprintf(
            '(COALESCE(%s.weight, 0) * CASE WHEN %s.weight_mode = \'%s\' THEN %d ELSE 1 END)',
            $setAlias,
            $exerciseAlias,
            self::PER_SIDE_WEIGHT_MODE,
            self::PER_SIDE_FACTOR,
        );
    }

    public static function volumeSql(string $setAlias, string $exerciseAlias): string
    {
        return sprintf(
            'COALESCE(SUM(%s.reps * %s), 0)',
            $setAlias,
            self::sql(setAlias: $setAlias, exerciseAlias: $exerciseAlias),
        );
    }
}
