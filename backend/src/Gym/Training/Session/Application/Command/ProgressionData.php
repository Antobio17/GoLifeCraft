<?php

namespace Gym\Training\Session\Application\Command;

use Gym\Training\Session\Domain\Model\SessionExercise;

final readonly class ProgressionData
{
    /**
     * @param int[] $repTargets
     */
    public function __construct(
        public string $mode = SessionExercise::PROGRESSION_NONE,
        public array $repTargets = [],
        public int $repTolerance = SessionExercise::DEFAULT_REP_TOLERANCE,
        public ?float $incrementKg = null,
    ) {
    }

    public static function fromArray(mixed $rawProgression): self
    {
        if (!is_array($rawProgression)) {
            return new self();
        }

        return new self(
            mode: self::mode(value: $rawProgression['mode'] ?? null),
            repTargets: self::repTargets(value: $rawProgression['repTargets'] ?? null),
            repTolerance: self::repTolerance(value: $rawProgression['repTolerance'] ?? null),
            incrementKg: self::incrementKg(value: $rawProgression['incrementKg'] ?? null),
        );
    }

    private static function mode(mixed $value): string
    {
        if (!is_string($value) || '' === $value) {
            return SessionExercise::PROGRESSION_NONE;
        }

        return $value;
    }

    /**
     * @return int[]
     */
    private static function repTargets(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        return array_map(
            callback: static fn (mixed $repTarget): int => (int) $repTarget,
            array: array_values(array: $value),
        );
    }

    private static function repTolerance(mixed $value): int
    {
        if (null === $value || '' === $value) {
            return SessionExercise::DEFAULT_REP_TOLERANCE;
        }

        return (int) $value;
    }

    private static function incrementKg(mixed $value): ?float
    {
        if (null === $value || '' === $value) {
            return null;
        }

        return (float) $value;
    }
}
