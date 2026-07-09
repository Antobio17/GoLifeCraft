<?php

namespace Gym\Training\Workout\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class FinishWorkoutCommand implements Command
{
    /**
     * @param WorkoutExerciseData[] $exercises
     */
    public function __construct(
        public string $workoutId,
        public array $exercises,
        public int $durationSeconds,
        public string $finishedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.workout.finish';
    }
}
