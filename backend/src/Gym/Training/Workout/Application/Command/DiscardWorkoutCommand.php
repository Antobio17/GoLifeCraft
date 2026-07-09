<?php

namespace Gym\Training\Workout\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DiscardWorkoutCommand implements Command
{
    public function __construct(
        public string $workoutId,
        public string $discardedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.workout.discard';
    }
}
