<?php

namespace Gym\Training\Workout\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class MarkWorkoutSetDoneCommand implements Command
{
    public function __construct(
        public string $workoutId,
        public string $setId,
        public bool $done,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.workout.set.mark_done';
    }
}
