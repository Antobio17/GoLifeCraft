<?php

namespace Gym\Training\Session\Application\Command;

final readonly class ExerciseSetData
{
    public function __construct(
        public int $position,
        public int $reps,
        public ?float $weight,
    ) {
    }

    public static function fromArray(array $rawSet, int $position): self
    {
        return new self(
            position: (int) ($rawSet['position'] ?? $position),
            reps: (int) ($rawSet['reps'] ?? 0),
            weight: self::nullableFloat(value: $rawSet['weight'] ?? null),
        );
    }

    /**
     * @return self[]
     */
    public static function listFromArray(array $rawSets): array
    {
        $sets = [];

        foreach (array_values(array: $rawSets) as $index => $rawSet) {
            $sets[] = self::fromArray(rawSet: $rawSet, position: $index + 1);
        }

        return $sets;
    }

    private static function nullableFloat(mixed $value): ?float
    {
        if (null === $value || '' === $value) {
            return null;
        }

        return (float) $value;
    }
}
