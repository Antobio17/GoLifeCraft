<?php

namespace App\Tests\Gym\Training\Session\Domain\Service;

use Gym\Training\Session\Domain\Model\ExerciseSet;
use Gym\Training\Session\Domain\Model\SessionExercise;
use Gym\Training\Session\Domain\Service\ProgressionPolicy;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ProgressionPolicyTest extends TestCase
{
    private ProgressionPolicy $policy;
    private DateTimeGenerator $dateTimeGenerator;

    protected function setUp(): void
    {
        $this->policy = new ProgressionPolicy();
        $this->dateTimeGenerator = new DateTimeGenerator();
    }

    public function testItLeavesAnExerciseWithoutProgressionAlone(): void
    {
        $exercise = $this->exercise(mode: SessionExercise::PROGRESSION_NONE, performed: [[12, 100.0], [11, 100.0], [10, 100.0]]);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [100.0, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));
    }

    public function testItRaisesOnlyTheFirstSetWhenTheWholeBlockReachesItsTarget(): void
    {
        $exercise = $this->exercise(performed: [[12, 100.0], [11, 100.0], [10, 100.0]]);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [102.5, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));
        $this->assertEquals(expected: [12, 11, 10], actual: $this->repsOf(exercise: $exercise));
    }

    public function testItRaisesEverySetAtOnceInBlockMode(): void
    {
        $exercise = $this->exercise(
            mode: SessionExercise::PROGRESSION_BLOCK,
            performed: [[12, 100.0], [11, 100.0], [10, 100.0]],
        );

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [102.5, 102.5, 102.5], actual: $this->weightsOf(exercise: $exercise));
    }

    public function testItStaysAtTheSameWeightWhileTheTargetIsNotReached(): void
    {
        $exercise = $this->exercise(performed: [[11, 100.0], [11, 100.0], [10, 100.0]]);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [100.0, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));
        $this->assertEquals(expected: 0, actual: $exercise->consecutiveHolds);
    }

    public function testItAdvancesOneSetWhenTheNewWeightHoldsAboveItsFloor(): void
    {
        $exercise = $this->exercise(performed: [[11, 102.5], [11, 100.0], [10, 100.0]]);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [102.5, 102.5, 100.0], actual: $this->weightsOf(exercise: $exercise));
    }

    public function testItAdvancesTwoSetsWhenTheNewWeightReachesItsTarget(): void
    {
        $exercise = $this->exercise(performed: [[12, 102.5], [11, 100.0], [10, 100.0]]);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [102.5, 102.5, 102.5], actual: $this->weightsOf(exercise: $exercise));
    }

    public function testItNeverAdvancesPastTheLastSet(): void
    {
        $exercise = $this->exercise(performed: [[12, 102.5], [12, 102.5], [10, 100.0]]);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [102.5, 102.5, 102.5], actual: $this->weightsOf(exercise: $exercise));
    }

    public function testItHoldsTheFirstTimeASetFallsBelowItsFloor(): void
    {
        $exercise = $this->exercise(performed: [[9, 102.5], [11, 100.0], [10, 100.0]]);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [102.5, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));
        $this->assertEquals(expected: 1, actual: $exercise->consecutiveHolds);
    }

    public function testItStepsBackTheSecondTimeInARow(): void
    {
        $exercise = $this->exercise(performed: [[9, 102.5], [11, 100.0], [10, 100.0]], holds: 1);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [100.0, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));
        $this->assertEquals(expected: 0, actual: $exercise->consecutiveHolds);
    }

    public function testAUniformBlockKeepsItsWeightAfterTwoFailures(): void
    {
        $exercise = $this->exercise(performed: [[8, 100.0], [8, 100.0], [7, 100.0]], holds: 1);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [100.0, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));
        $this->assertEquals(expected: 2, actual: $exercise->consecutiveHolds);
    }

    public function testAUniformBlockStepsDownOneIncrementAfterThreeFailures(): void
    {
        $exercise = $this->exercise(performed: [[8, 100.0], [8, 100.0], [7, 100.0]], holds: 2);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [97.5, 97.5, 97.5], actual: $this->weightsOf(exercise: $exercise));
        $this->assertEquals(expected: 0, actual: $exercise->consecutiveHolds);
    }

    public function testAGoodWorkoutClearsTheHoldsAlreadyCounted(): void
    {
        $exercise = $this->exercise(performed: [[11, 102.5], [11, 100.0], [10, 100.0]], holds: 1);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: 0, actual: $exercise->consecutiveHolds);
    }

    public function testItDoesNotAdvanceWhenTheOldWeightMissesItsTarget(): void
    {
        $exercise = $this->exercise(performed: [[12, 102.5], [10, 100.0], [10, 100.0]]);

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [102.5, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));
    }

    public function testTheWarmupRampFollowsTheWeightUp(): void
    {
        $exercise = $this->exercise(
            performed: [[12, 100.0], [11, 100.0], [10, 100.0]],
            warmups: [[12, 50.0], [4, 80.0]],
        );

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [102.5, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));
        $this->assertEquals(expected: [52.5, 82.5], actual: $this->warmupsOf(exercise: $exercise));
    }

    public function testTheWarmupRampFollowsTheWeightDownWhenTheBlockStepsDown(): void
    {
        $exercise = $this->exercise(
            performed: [[8, 100.0], [8, 100.0], [7, 100.0]],
            warmups: [[12, 50.0], [4, 80.0]],
            holds: 2,
        );

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [97.5, 97.5, 97.5], actual: $this->weightsOf(exercise: $exercise));
        $this->assertEquals(expected: [50.0, 77.5], actual: $this->warmupsOf(exercise: $exercise));
    }

    public function testTheWarmupRampFollowsTheWeightDownOnAStepBack(): void
    {
        $exercise = $this->exercise(
            performed: [[9, 102.5], [11, 100.0], [10, 100.0]],
            warmups: [[12, 51.25], [4, 82.0]],
            holds: 1,
        );

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [100.0, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));
        $this->assertEquals(expected: [50.0, 80.0], actual: $this->warmupsOf(exercise: $exercise));
    }

    public function testTheWarmupRampKeepsItsShapeOverManySteps(): void
    {
        $exercise = $this->exercise(
            performed: [[12, 100.0], [11, 100.0], [10, 100.0]],
            warmups: [[12, 50.0]],
        );

        for ($step = 0; $step < 4; ++$step) {
            $this->policy->apply(sessionExercise: $exercise);
            $this->perform(exercise: $exercise, reps: [12, 11, 10]);
            $this->settleStep(exercise: $exercise);
        }

        $this->assertEquals(expected: 110.0, actual: $exercise->workingWeight());
        $this->assertEquals(expected: [55.0], actual: $this->warmupsOf(exercise: $exercise));
    }

    public function testItDoesNothingWithoutAnIncrement(): void
    {
        $exercise = $this->exercise(performed: [[12, 100.0], [11, 100.0], [10, 100.0]]);
        $exercise->incrementKg = null;

        $this->policy->apply(sessionExercise: $exercise);

        $this->assertEquals(expected: [100.0, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));
    }

    public function testItWalksAWholeCascadeStep(): void
    {
        $exercise = $this->exercise(performed: [[12, 100.0], [11, 100.0], [10, 100.0]]);

        $this->policy->apply(sessionExercise: $exercise);
        $this->assertEquals(expected: [102.5, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));

        $this->perform(exercise: $exercise, reps: [9, 11, 10]);
        $this->policy->apply(sessionExercise: $exercise);
        $this->assertEquals(expected: [102.5, 100.0, 100.0], actual: $this->weightsOf(exercise: $exercise));

        $this->perform(exercise: $exercise, reps: [10, 11, 10]);
        $this->policy->apply(sessionExercise: $exercise);
        $this->assertEquals(expected: [102.5, 102.5, 100.0], actual: $this->weightsOf(exercise: $exercise));

        $this->perform(exercise: $exercise, reps: [12, 9, 10]);
        $this->policy->apply(sessionExercise: $exercise);
        $this->assertEquals(expected: [102.5, 102.5, 102.5], actual: $this->weightsOf(exercise: $exercise));

        $this->perform(exercise: $exercise, reps: [12, 11, 10]);
        $this->policy->apply(sessionExercise: $exercise);
        $this->assertEquals(expected: [105.0, 102.5, 102.5], actual: $this->weightsOf(exercise: $exercise));
    }

    /**
     * @param array<int, array{0: int, 1: float}> $performed
     * @param array<int, array{0: int, 1: float}> $warmups
     */
    private function exercise(
        array $performed,
        string $mode = SessionExercise::PROGRESSION_CASCADE,
        array $warmups = [],
        int $holds = 0,
    ): SessionExercise {
        $exercise = SessionExercise::create(
            sessionId: 'session-1',
            exerciseId: 'exercise-1',
            position: 1,
            note: null,
            createdByUserId: 'user-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $exercise->configureProgression(
            mode: $mode,
            repTargets: SessionExercise::PROGRESSION_NONE === $mode ? [] : [12, 11, 10],
            repTolerance: 2,
            incrementKg: SessionExercise::PROGRESSION_NONE === $mode ? null : 2.5,
            updatedByUserId: 'user-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        foreach ($warmups as $warmup) {
            $exercise->addSet(exerciseSet: $this->set(reps: $warmup[0], weight: $warmup[1], kind: ExerciseSet::KIND_WARMUP));
        }

        foreach ($performed as $set) {
            $exercise->addSet(exerciseSet: $this->set(reps: $set[0], weight: $set[1]));
        }

        $exercise->captureWarmupRamp();

        for ($hold = 0; $hold < $holds; ++$hold) {
            $exercise->holdOnce();
        }

        return $exercise;
    }

    private function set(int $reps, float $weight, string $kind = ExerciseSet::KIND_EFFECTIVE): ExerciseSet
    {
        return ExerciseSet::create(
            sessionExerciseId: 'session-exercise-1',
            position: 1,
            reps: $reps,
            weight: $weight,
            createdByUserId: 'user-1',
            dateTimeGenerator: $this->dateTimeGenerator,
            kind: $kind,
        );
    }

    /**
     * @param int[] $reps
     */
    private function perform(SessionExercise $exercise, array $reps): void
    {
        $effective = array_values(array_filter($exercise->sets, static fn (ExerciseSet $set): bool => $set->isEffective()));

        foreach ($effective as $index => $set) {
            $set->planFor(reps: $reps[$index], weight: $set->weight);
        }
    }

    private function settleStep(SessionExercise $exercise): void
    {
        $top = $exercise->workingWeight();

        foreach ($exercise->sets as $set) {
            if (!$set->isEffective()) {
                continue;
            }

            $set->planFor(reps: $set->reps, weight: $top);
        }
    }

    /**
     * @return float[]
     */
    private function warmupsOf(SessionExercise $exercise): array
    {
        return array_values(array_map(
            static fn (ExerciseSet $set): ?float => $set->weight,
            array_filter($exercise->sets, static fn (ExerciseSet $set): bool => !$set->isEffective()),
        ));
    }

    /**
     * @return float[]
     */
    private function weightsOf(SessionExercise $exercise): array
    {
        return array_values(array_map(
            static fn (ExerciseSet $set): ?float => $set->weight,
            array_filter($exercise->sets, static fn (ExerciseSet $set): bool => $set->isEffective()),
        ));
    }

    /**
     * @return int[]
     */
    private function repsOf(SessionExercise $exercise): array
    {
        return array_values(array_map(
            static fn (ExerciseSet $set): int => $set->reps,
            array_filter($exercise->sets, static fn (ExerciseSet $set): bool => $set->isEffective()),
        ));
    }
}
