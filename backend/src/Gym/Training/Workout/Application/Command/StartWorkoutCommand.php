<?php

namespace Gym\Training\Workout\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class StartWorkoutCommand implements Command
{
    /**
     * @param WorkoutExerciseData[] $exercises
     */
    public function __construct(
        public string $workoutId,
        public ?string $sessionId,
        public string $sessionName,
        public array $exercises,
        public string $startedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.workout.start';
    }
}
