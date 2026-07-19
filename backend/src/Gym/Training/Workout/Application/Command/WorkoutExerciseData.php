<?php

namespace Gym\Training\Workout\Application\Command;

final readonly class WorkoutExerciseData
{
    /**
     * @param WorkoutSetData[] $sets
     */
    public function __construct(
        public string $exerciseId,
        public string $exerciseName,
        public string $type,
        public array $muscleGroups,
        public int $position,
        public ?string $note,
        public array $sets,
    ) {
    }

    public static function fromArray(array $rawExercise, int $position): self
    {
        return new self(
            exerciseId: (string) ($rawExercise['exerciseId'] ?? ''),
            exerciseName: (string) ($rawExercise['exerciseName'] ?? ''),
            type: (string) ($rawExercise['type'] ?? ''),
            muscleGroups: self::stringList(value: $rawExercise['muscleGroups'] ?? []),
            position: (int) ($rawExercise['position'] ?? $position),
            note: self::nullableString(value: $rawExercise['note'] ?? null),
            sets: WorkoutSetData::listFromArray(rawSets: $rawExercise['sets'] ?? []),
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

    private static function nullableString(mixed $value): ?string
    {
        if (null === $value || '' === $value) {
            return null;
        }

        return (string) $value;
    }

    /**
     * @return string[]
     */
    private static function stringList(mixed $value): array
    {
        if (!is_array(value: $value)) {
            return [];
        }

        return array_values(array: array_map(callback: 'strval', array: $value));
    }
}
