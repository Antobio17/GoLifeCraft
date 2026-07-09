<?php

namespace Gym\Training\Workout\Domain\QueryModel\Dto;

final readonly class WorkoutExerciseView
{
    /**
     * @param WorkoutSetView[] $sets
     */
    public function __construct(
        public string $id,
        public ?string $exerciseId,
        public string $exerciseName,
        public array $muscleGroups,
        public string $type,
        public int $position,
        public ?string $note,
        public array $sets,
    ) {
    }
}
