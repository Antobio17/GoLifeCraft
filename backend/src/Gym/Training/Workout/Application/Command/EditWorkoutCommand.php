<?php

namespace Gym\Training\Workout\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class EditWorkoutCommand implements Command
{
    /**
     * @param WorkoutExerciseData[] $exercises
     */
    public function __construct(
        public string $workoutId,
        public string $sessionName,
        public \DateTime $startedAt,
        public int $durationSeconds,
        public array $exercises,
        public string $editedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.gym.command.1.workout.edit';
    }
}
