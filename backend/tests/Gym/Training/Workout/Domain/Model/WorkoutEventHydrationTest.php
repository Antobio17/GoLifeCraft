<?php

namespace App\Tests\Gym\Training\Workout\Domain\Model;

use Gym\Training\Workout\Domain\Event\WorkoutFinished;
use Gym\Training\Workout\Domain\Event\WorkoutProgressSaved;
use Gym\Training\Workout\Domain\Event\WorkoutStarted;
use Gym\Training\Workout\Domain\Model\Workout;
use Gym\Training\Workout\Domain\Model\WorkoutExercise;
use Gym\Training\Workout\Domain\Model\WorkoutSet;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class WorkoutEventHydrationTest extends TestCase
{
    private DateTimeGenerator $dateTimeGenerator;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
    }

    public function testStartedCarriesTheWholeWorkout(): void
    {
        $workout = $this->workout();

        /** @var WorkoutStarted $event */
        $event = $workout->pullDomainEvents()[0];

        $this->assertInstanceOf(expected: WorkoutStarted::class, actual: $event);
        $this->assertSame(expected: 'session-1', actual: $event->sessionId);
        $this->assertSame(expected: 'Torso A', actual: $event->sessionName);
        $this->assertSame(expected: Workout::STATUS_IN_PROGRESS, actual: $event->status);
        $this->assertSame(expected: 0, actual: $event->durationSeconds);
        $this->assertNull(actual: $event->finishedAt);
        $this->assertSame(expected: 'god-user-id', actual: $event->startedByUserId);
        $this->assertCount(expectedCount: 1, haystack: $event->exercises);
        $this->assertSame(expected: 'Press banca', actual: $event->exercises[0]['exerciseName']);
    }

    public function testSavingProgressIsRecorded(): void
    {
        $workout = $this->workout();
        $workout->pullDomainEvents();

        $workout->saveProgress(
            exercises: $workout->exercises,
            durationSeconds: 900,
            updatedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
            sessionName: 'Torso A bis',
        );

        /** @var WorkoutProgressSaved $event */
        $event = $workout->pullDomainEvents()[0];

        $this->assertInstanceOf(expected: WorkoutProgressSaved::class, actual: $event);
        $this->assertSame(expected: 'Torso A bis', actual: $event->sessionName);
        $this->assertSame(expected: 900, actual: $event->durationSeconds);
        $this->assertSame(expected: Workout::STATUS_IN_PROGRESS, actual: $event->status);
        $this->assertCount(expectedCount: 1, haystack: $event->exercises);
        $this->assertCount(expectedCount: 1, haystack: $event->exercises[0]['sets']);
        $this->assertTrue(condition: $event->exercises[0]['sets'][0]['done']);
    }

    public function testFinishedCarriesTheWholeWorkout(): void
    {
        $workout = $this->workout();
        $workout->pullDomainEvents();

        $workout->finish(
            exercises: $workout->exercises,
            durationSeconds: 3600,
            templateSyncMode: WorkoutFinished::TEMPLATE_SYNC_SETS,
            finishedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        /** @var WorkoutFinished $event */
        $event = $workout->pullDomainEvents()[0];

        $this->assertInstanceOf(expected: WorkoutFinished::class, actual: $event);
        $this->assertSame(expected: Workout::STATUS_COMPLETED, actual: $event->status);
        $this->assertSame(expected: 3600, actual: $event->durationSeconds);
        $this->assertNotNull(actual: $event->finishedAt);
        $this->assertSame(expected: 'god-user-id', actual: $event->createdByUserId);
        $this->assertSame(expected: 'exercise-1', actual: $event->exercises[0]['exerciseId']);
        $this->assertSame(expected: 60.0, actual: $event->exercises[0]['sets'][0]['weight']);
    }

    private function workout(): Workout
    {
        $workoutExercise = WorkoutExercise::create(
            workoutId: 'workout-1',
            exerciseId: 'exercise-1',
            exerciseName: 'Press banca',
            type: 'strength',
            muscleGroups: ['chest'],
            position: 1,
            note: null,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $workoutExercise->addSet(workoutSet: WorkoutSet::create(
            workoutExerciseId: $workoutExercise->id,
            position: 1,
            reps: 10,
            weight: 60.0,
            done: true,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));

        return Workout::start(
            id: 'workout-1',
            sessionId: 'session-1',
            sessionName: 'Torso A',
            exercises: [$workoutExercise],
            startedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }
}
