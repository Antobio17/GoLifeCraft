<?php

namespace Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Domain\Model\WorkoutSet;

final readonly class WorkoutSetData
{
    public function __construct(
        public int $position,
        public int $reps,
        public ?float $weight,
        public bool $done,
        public string $kind = WorkoutSet::KIND_EFFECTIVE,
    ) {
    }

    public static function fromArray(array $rawSet, int $position): self
    {
        return new self(
            position: (int) ($rawSet['position'] ?? $position),
            reps: (int) ($rawSet['reps'] ?? 0),
            weight: self::nullableFloat(value: $rawSet['weight'] ?? null),
            done: (bool) ($rawSet['done'] ?? false),
            kind: self::kind(value: $rawSet['kind'] ?? null),
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

    private static function kind(mixed $value): string
    {
        if (!is_string($value) || '' === $value) {
            return WorkoutSet::KIND_EFFECTIVE;
        }

        return $value;
    }
}
