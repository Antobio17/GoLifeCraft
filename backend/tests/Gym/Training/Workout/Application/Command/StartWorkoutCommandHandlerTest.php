<?php

namespace App\Tests\Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Application\Command\StartWorkoutCommand;
use Gym\Training\Workout\Application\Command\StartWorkoutCommandHandler;
use Gym\Training\Workout\Application\Command\WorkoutExerciseAssembler;
use Gym\Training\Workout\Application\Command\WorkoutExerciseData;
use Gym\Training\Workout\Application\Command\WorkoutSetData;
use Gym\Training\Workout\Domain\Exception\StartWorkoutException;
use Gym\Training\Workout\Domain\Model\Workout;
use Gym\Training\Workout\Infrastructure\Domain\Model\InMemory\InMemoryWorkoutRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class StartWorkoutCommandHandlerTest extends TestCase
{
    private InMemoryWorkoutRepository $workoutRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private StartWorkoutCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->workoutRepository = new InMemoryWorkoutRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new StartWorkoutCommandHandler(
            workoutRepository: $this->workoutRepository,
            workoutExerciseAssembler: new WorkoutExerciseAssembler(dateTimeGenerator: $dateTimeGenerator),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItStartsAWorkoutWithSnapshotOfExercisesAndSets(): void
    {
        $workoutId = 'workout-1';

        ($this->handler)(new StartWorkoutCommand(
            workoutId: $workoutId,
            sessionId: 'session-1',
            sessionName: 'Empuje A',
            exercises: [
                new WorkoutExerciseData(
                    exerciseId: 'ex-1',
                    exerciseName: 'Press banca',
                    type: 'bilateral',
                    muscleGroups: ['Pecho', 'Tríceps'],
                    position: 1,
                    note: null,
                    sets: [
                        new WorkoutSetData(position: 1, reps: 10, weight: 40.0, done: false),
                        new WorkoutSetData(position: 2, reps: 8, weight: 45.0, done: false),
                    ],
                ),
            ],
            startedByUserId: 'god-user-id',
        ));

        $workout = $this->workoutRepository->findById(id: $workoutId);
        $this->assertNotNull(actual: $workout);
        $this->assertEquals(expected: Workout::STATUS_IN_PROGRESS, actual: $workout->status);
        $this->assertEquals(expected: 'Empuje A', actual: $workout->sessionName);
        $this->assertNull(actual: $workout->finishedAt);
        $this->assertCount(expectedCount: 1, haystack: $workout->exercises);
        $this->assertEquals(expected: $workout->id, actual: $workout->exercises[0]->workoutId);
        $this->assertEquals(expected: 'Press banca', actual: $workout->exercises[0]->exerciseName);
        $this->assertEquals(expected: 'bilateral', actual: $workout->exercises[0]->type);
        $this->assertEquals(expected: ['Pecho', 'Tríceps'], actual: $workout->exercises[0]->muscleGroups);
        $this->assertCount(expectedCount: 2, haystack: $workout->exercises[0]->sets);
        $this->assertEquals(expected: $workout->exercises[0]->id, actual: $workout->exercises[0]->sets[0]->workoutExerciseId);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItThrowsExceptionWhenStartingWithoutExercises(): void
    {
        $this->expectException(exception: StartWorkoutException::class);

        ($this->handler)(new StartWorkoutCommand(
            workoutId: 'workout-1',
            sessionId: 'session-1',
            sessionName: 'Empuje A',
            exercises: [],
            startedByUserId: 'god-user-id',
        ));
    }
}
