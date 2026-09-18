<?php

namespace Gym\Training\Session\Domain\Service;

use Gym\Training\Session\Domain\Model\ExerciseSet;
use Gym\Training\Session\Domain\Model\SessionExercise;

/**
 * Decide qué peso toca la próxima vez a partir de lo que se acaba de entrenar.
 *
 * Lee dos umbrales por serie efectiva: el objetivo (`repTargets`) dispara el
 * siguiente escalón, y el suelo (objetivo menos la tolerancia) marca a partir de
 * dónde una serie se considera fallada. Trabaja sólo sobre los pesos: las
 * repeticiones de la plantilla pasan a ser el objetivo, porque a partir de aquí
 * la plantilla es el plan y no el registro de lo hecho.
 */
final readonly class ProgressionPolicy
{
    private const float DELOAD_FACTOR = 0.93;
    private const int HOLDS_BEFORE_RETREAT = 2;

    public function apply(SessionExercise $sessionExercise): void
    {
        if (!$sessionExercise->progresses()) {
            return;
        }

        $performed = self::effectiveSets(sessionExercise: $sessionExercise);
        if ([] === $performed) {
            return;
        }

        $increment = $sessionExercise->incrementKg;
        if (null === $increment) {
            return;
        }

        $weights = array_map(callback: static fn (ExerciseSet $set): float => $set->weight ?? 0.0, array: $performed);
        $baseWeight = min($weights);
        $advanced = self::advancedSets(weights: $weights, baseWeight: $baseWeight);

        if (self::anyBelowFloor(sessionExercise: $sessionExercise, performed: $performed)) {
            $this->stepBack(
                sessionExercise: $sessionExercise,
                performed: $performed,
                baseWeight: $baseWeight,
                advanced: $advanced,
                increment: $increment,
            );

            return;
        }

        $sessionExercise->clearHolds();
        $this->stepForward(
            sessionExercise: $sessionExercise,
            performed: $performed,
            baseWeight: $baseWeight,
            advanced: $advanced,
            increment: $increment,
        );
    }

    /**
     * @param ExerciseSet[] $performed
     */
    private function stepBack(
        SessionExercise $sessionExercise,
        array $performed,
        float $baseWeight,
        int $advanced,
        float $increment,
    ): void {
        $sessionExercise->holdOnce();

        if ($sessionExercise->consecutiveHolds < self::HOLDS_BEFORE_RETREAT) {
            self::writeTargets(sessionExercise: $sessionExercise, performed: $performed);

            return;
        }

        $sessionExercise->clearHolds();

        if ($advanced > 0) {
            self::writePlan(
                sessionExercise: $sessionExercise,
                performed: $performed,
                baseWeight: $baseWeight,
                advanced: $advanced - 1,
                increment: $increment,
            );

            return;
        }

        self::writePlan(
            sessionExercise: $sessionExercise,
            performed: $performed,
            baseWeight: self::deloaded(weight: $baseWeight, increment: $increment),
            advanced: 0,
            increment: $increment,
        );
    }

    /**
     * @param ExerciseSet[] $performed
     */
    private function stepForward(
        SessionExercise $sessionExercise,
        array $performed,
        float $baseWeight,
        int $advanced,
        float $increment,
    ): void {
        $total = count($performed);

        if (0 === $advanced) {
            if (!self::allReachedTarget(sessionExercise: $sessionExercise, performed: $performed)) {
                self::writeTargets(sessionExercise: $sessionExercise, performed: $performed);

                return;
            }

            self::writePlan(
                sessionExercise: $sessionExercise,
                performed: $performed,
                baseWeight: $baseWeight,
                advanced: SessionExercise::PROGRESSION_BLOCK === $sessionExercise->progressionMode ? $total : 1,
                increment: $increment,
            );

            return;
        }

        if (!self::baseSetsReachedTarget(sessionExercise: $sessionExercise, performed: $performed, baseWeight: $baseWeight)) {
            self::writeTargets(sessionExercise: $sessionExercise, performed: $performed);

            return;
        }

        $step = self::topSetsReachedTarget(sessionExercise: $sessionExercise, performed: $performed, baseWeight: $baseWeight) ? 2 : 1;

        self::writePlan(
            sessionExercise: $sessionExercise,
            performed: $performed,
            baseWeight: $baseWeight,
            advanced: min($advanced + $step, $total),
            increment: $increment,
        );
    }

    /**
     * Las series que ya llevan el peso nuevo van al principio: es la primera la
     * que carga con el escalón y las de después esperan su turno.
     *
     * @param ExerciseSet[] $performed
     */
    private static function writePlan(
        SessionExercise $sessionExercise,
        array $performed,
        float $baseWeight,
        int $advanced,
        float $increment,
    ): void {
        $topWeight = $baseWeight + $increment;

        foreach (array_values(array: $performed) as $index => $set) {
            $set->planFor(
                reps: self::targetAt(sessionExercise: $sessionExercise, index: $index, fallback: $set->reps),
                weight: $index < $advanced ? $topWeight : $baseWeight,
            );
        }
    }

    /**
     * @param ExerciseSet[] $performed
     */
    private static function writeTargets(SessionExercise $sessionExercise, array $performed): void
    {
        foreach (array_values(array: $performed) as $index => $set) {
            $set->planFor(
                reps: self::targetAt(sessionExercise: $sessionExercise, index: $index, fallback: $set->reps),
                weight: $set->weight,
            );
        }
    }

    /**
     * @param ExerciseSet[] $performed
     */
    private static function anyBelowFloor(SessionExercise $sessionExercise, array $performed): bool
    {
        foreach (array_values(array: $performed) as $index => $set) {
            if ($set->reps < self::floorAt(sessionExercise: $sessionExercise, index: $index, fallback: $set->reps)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param ExerciseSet[] $performed
     */
    private static function allReachedTarget(SessionExercise $sessionExercise, array $performed): bool
    {
        foreach (array_values(array: $performed) as $index => $set) {
            if ($set->reps < self::targetAt(sessionExercise: $sessionExercise, index: $index, fallback: $set->reps)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param ExerciseSet[] $performed
     */
    private static function baseSetsReachedTarget(SessionExercise $sessionExercise, array $performed, float $baseWeight): bool
    {
        foreach (array_values(array: $performed) as $index => $set) {
            if (($set->weight ?? 0.0) > $baseWeight) {
                continue;
            }

            if ($set->reps < self::targetAt(sessionExercise: $sessionExercise, index: $index, fallback: $set->reps)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param ExerciseSet[] $performed
     */
    private static function topSetsReachedTarget(SessionExercise $sessionExercise, array $performed, float $baseWeight): bool
    {
        foreach (array_values(array: $performed) as $index => $set) {
            if (($set->weight ?? 0.0) <= $baseWeight) {
                continue;
            }

            if ($set->reps < self::targetAt(sessionExercise: $sessionExercise, index: $index, fallback: $set->reps)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param float[] $weights
     */
    private static function advancedSets(array $weights, float $baseWeight): int
    {
        return count(array_filter(array: $weights, callback: static fn (float $weight): bool => $weight > $baseWeight));
    }

    private static function targetAt(SessionExercise $sessionExercise, int $index, int $fallback): int
    {
        return $sessionExercise->repTargets[$index] ?? $fallback;
    }

    private static function floorAt(SessionExercise $sessionExercise, int $index, int $fallback): int
    {
        return max(1, self::targetAt(sessionExercise: $sessionExercise, index: $index, fallback: $fallback) - $sessionExercise->repTolerance);
    }

    private static function deloaded(float $weight, float $increment): float
    {
        $steps = floor($weight * self::DELOAD_FACTOR / $increment);

        return max($increment, $steps * $increment);
    }

    /**
     * @return ExerciseSet[]
     */
    private static function effectiveSets(SessionExercise $sessionExercise): array
    {
        return array_values(array: array_filter(
            array: $sessionExercise->sets,
            callback: static fn (ExerciseSet $set): bool => $set->isEffective(),
        ));
    }
}
