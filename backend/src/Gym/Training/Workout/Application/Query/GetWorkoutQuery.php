<?php

namespace Gym\Training\Workout\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetWorkoutQuery implements Query
{
    public function __construct(
        public string $workoutId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.query.1.workout.get';
    }
}
