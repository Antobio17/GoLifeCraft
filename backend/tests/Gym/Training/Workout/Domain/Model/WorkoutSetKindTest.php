<?php

namespace App\Tests\Gym\Training\Workout\Domain\Model;

use Gym\Training\Workout\Domain\Exception\UpdateWorkoutException;
use Gym\Training\Workout\Domain\Model\WorkoutExercise;
use Gym\Training\Workout\Domain\Model\WorkoutSet;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class WorkoutSetKindTest extends TestCase
{
    private DateTimeGenerator $dateTimeGenerator;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
    }

    public function testItDefaultsToEffectiveWhenNoKindIsGiven(): void
    {
        $workoutSet = $this->workoutSet();

        $this->assertEquals(expected: WorkoutSet::KIND_EFFECTIVE, actual: $workoutSet->kind);
        $this->assertTrue(condition: $workoutSet->isEffective());
    }

    public function testItRejectsAnUnknownKind(): void
    {
        $this->expectException(exception: UpdateWorkoutException::class);

        $this->workoutSet(kind: 'ramp');
    }

    public function testItCarriesTheKindIntoTheExerciseSnapshot(): void
    {
        $workoutExercise = WorkoutExercise::create(
            workoutId: 'workout-1',
            exerciseId: 'exercise-1',
            exerciseName: 'Press banca',
            type: 'strength',
            weightMode: WorkoutExercise::WEIGHT_MODE_TOTAL,
            muscleGroups: ['chest'],
            position: 1,
            note: null,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $workoutExercise->addSet(workoutSet: $this->workoutSet(kind: WorkoutSet::KIND_WARMUP));
        $workoutExercise->addSet(workoutSet: $this->workoutSet());

        $snapshot = $workoutExercise->snapshot();

        $this->assertEquals(expected: WorkoutSet::KIND_WARMUP, actual: $snapshot['sets'][0]['kind']);
        $this->assertEquals(expected: WorkoutSet::KIND_EFFECTIVE, actual: $snapshot['sets'][1]['kind']);
    }

    private function workoutSet(string $kind = WorkoutSet::KIND_EFFECTIVE): WorkoutSet
    {
        return WorkoutSet::create(
            workoutExerciseId: 'workout-exercise-1',
            position: 1,
            reps: 10,
            weight: 60.0,
            done: true,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
            kind: $kind,
        );
    }
}
