<?php

namespace Gym\Training\Session\Domain\QueryModel\Dto;

final readonly class SessionExerciseView
{
    /**
     * @param ExerciseSetView[] $sets
     */
    public function __construct(
        public string $id,
        public ?string $exerciseId,
        public string $exerciseName,
        public array $muscleGroups,
        public string $type,
        public string $weightMode,
        public int $position,
        public ?string $note,
        public array $sets,
        public ProgressionView $progression,
    ) {
    }
}
