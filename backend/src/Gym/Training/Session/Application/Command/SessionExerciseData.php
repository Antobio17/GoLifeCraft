<?php

namespace Gym\Training\Session\Application\Command;

final readonly class SessionExerciseData
{
    /**
     * @param ExerciseSetData[] $sets
     */
    public function __construct(
        public string $exerciseId,
        public int $position,
        public array $sets,
    ) {
    }

    public static function fromArray(array $rawExercise, int $position): self
    {
        return new self(
            exerciseId: (string) ($rawExercise['exerciseId'] ?? ''),
            position: (int) ($rawExercise['position'] ?? $position),
            sets: ExerciseSetData::listFromArray(rawSets: $rawExercise['sets'] ?? []),
        );
    }

    /**
     * @return self[]
     */
    public static function listFromArray(array $rawExercises): array
    {
        $exercises = [];

        foreach (array_values(array: $rawExercises) as $index => $rawExercise) {
            $exercises[] = self::fromArray(rawExercise: $rawExercise, position: $index + 1);
        }

        return $exercises;
    }
}
