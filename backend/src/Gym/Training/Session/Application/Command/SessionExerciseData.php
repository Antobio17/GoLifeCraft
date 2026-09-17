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
        public ?string $note = null,
        public ProgressionData $progression = new ProgressionData(),
    ) {
    }

    public static function fromArray(array $rawExercise, int $position): self
    {
        return new self(
            exerciseId: (string) ($rawExercise['exerciseId'] ?? ''),
            position: (int) ($rawExercise['position'] ?? $position),
            note: self::nullableString(value: $rawExercise['note'] ?? null),
            sets: ExerciseSetData::listFromArray(rawSets: $rawExercise['sets'] ?? []),
            progression: ProgressionData::fromArray(rawProgression: $rawExercise['progression'] ?? null),
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
}
