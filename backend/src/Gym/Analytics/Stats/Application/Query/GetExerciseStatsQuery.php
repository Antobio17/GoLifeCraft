<?php

namespace Gym\Analytics\Stats\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetExerciseStatsQuery implements Query
{
    public function __construct(
        public string $exerciseId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.query.1.exercise_stats.get';
    }
}
