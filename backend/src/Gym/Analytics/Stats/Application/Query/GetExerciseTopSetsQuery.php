<?php

namespace Gym\Analytics\Stats\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetExerciseTopSetsQuery implements Query
{
    /**
     * @param array<int, string> $exerciseIds
     */
    public function __construct(
        public array $exerciseIds,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.query.1.exercise_top_sets.get';
    }
}
