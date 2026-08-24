<?php

namespace Gym\Training\Workout\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetActiveWorkoutQuery implements Query
{
    public static function getName(): string
    {
        return 'golifecraft.gym.query.1.workout.active.get';
    }
}
