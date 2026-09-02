<?php

namespace App\Tests\Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Application\Command\StartWorkoutCommand;
use Gym\Training\Workout\Application\Command\StartWorkoutCommandHandler;
use Gym\Training\Workout\Application\Command\UpdateWorkoutCommand;
use Gym\Training\Workout\Application\Command\UpdateWorkoutCommandHandler;
use Gym\Training\Workout\Application\Command\WorkoutExerciseAssembler;
use Gym\Training\Workout\Application\Command\WorkoutExerciseData;
use Gym\Training\Workout\Application\Command\WorkoutSetData;
use Gym\Training\Workout\Domain\Exception\UpdateWorkoutException;
use Gym\Training\Workout\Domain\Model\Workout;
use Gym\Training\Workout\Infrastructure\Domain\Model\InMemory\InMemoryWorkoutRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateWorkoutCommandHandlerTest extends TestCase
{
    private InMemoryWorkoutRepository $workoutRepository;
    private WorkoutExerciseAssembler $assembler;
    private DomainEventCollectorService $domainEventCollectorService;
    private StartWorkoutCommandHandler $startHandler;
    private UpdateWorkoutCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->workoutRepository = new InMemoryWorkoutRepository();
        $this->assembler = new WorkoutExerciseAssembler(dateTimeGenerator: $dateTimeGenerator);
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->startHandler = new StartWorkoutCommandHandler(
            workoutRepository: $this->workoutRepository,
            workoutExerciseAssembler: $this->assembler,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->handler = new UpdateWorkoutCommandHandler(
            workoutRepository: $this->workoutRepository,
            workoutExerciseAssembler: $this->assembler,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItSavesProgressOnAnActiveWorkout(): void
    {
        $workoutId = 'workout-1';

        ($this->startHandler)(new StartWorkoutCommand(
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
                    ],
                ),
            ],
            startedByUserId: 'god-user-id',
        ));

        ($this->handler)(new UpdateWorkoutCommand(
            workoutId: $workoutId,
            exercises: [
                new WorkoutExerciseData(
                    exerciseId: 'ex-1',
                    exerciseName: 'Press banca',
                    type: 'bilateral',
                    muscleGroups: ['Pecho', 'Tríceps'],
                    position: 1,
                    note: 'Buenas sensaciones',
                    sets: [
                        new WorkoutSetData(position: 1, reps: 12, weight: 42.5, done: true),
                    ],
                ),
            ],
            durationSeconds: 600,
            updatedByUserId: 'god-user-id',
        ));

        $workout = $this->workoutRepository->findById(id: $workoutId);
        $this->assertEquals(expected: Workout::STATUS_IN_PROGRESS, actual: $workout->status);
        $this->assertEquals(expected: 600, actual: $workout->durationSeconds);
        $this->assertEquals(expected: 12, actual: $workout->exercises[0]->sets[0]->reps);
        $this->assertTrue(condition: $workout->exercises[0]->sets[0]->done);
    }

    public function testItRenamesAFreeWorkoutOnProgress(): void
    {
        $workoutId = 'workout-free-1';

        ($this->startHandler)(new StartWorkoutCommand(
            workoutId: $workoutId,
            sessionId: null,
            sessionName: 'Entrenamiento libre',
            exercises: [],
            startedByUserId: 'god-user-id',
        ));

        ($this->handler)(new UpdateWorkoutCommand(
            workoutId: $workoutId,
            exercises: [],
            durationSeconds: 120,
            updatedByUserId: 'god-user-id',
            sessionName: '  Pecho improvisado  ',
        ));

        $workout = $this->workoutRepository->findById(id: $workoutId);
        $this->assertEquals(expected: 'Pecho improvisado', actual: $workout->sessionName);
    }

    public function testItKeepsTheWorkoutNameWhenNoneIsGiven(): void
    {
        $workoutId = 'workout-free-2';

        ($this->startHandler)(new StartWorkoutCommand(
            workoutId: $workoutId,
            sessionId: null,
            sessionName: 'Entrenamiento libre',
            exercises: [],
            startedByUserId: 'god-user-id',
        ));

        ($this->handler)(new UpdateWorkoutCommand(
            workoutId: $workoutId,
            exercises: [],
            durationSeconds: 120,
            updatedByUserId: 'god-user-id',
            sessionName: '   ',
        ));

        $workout = $this->workoutRepository->findById(id: $workoutId);
        $this->assertEquals(expected: 'Entrenamiento libre', actual: $workout->sessionName);
    }

    public function testItStoresWhenTheRestStarted(): void
    {
        $workoutId = 'workout-rest-1';
        $restStartedAt = new \DateTime(datetime: '2026-01-01 08:00:00');

        ($this->startHandler)(new StartWorkoutCommand(
            workoutId: $workoutId,
            sessionId: 'session-1',
            sessionName: 'Empuje A',
            exercises: [
                new WorkoutExerciseData(
                    exerciseId: 'ex-1',
                    exerciseName: 'Press banca',
                    type: 'bilateral',
                    muscleGroups: ['Pecho'],
                    position: 1,
                    note: null,
                    sets: [
                        new WorkoutSetData(position: 1, reps: 10, weight: 40.0, done: false),
                    ],
                ),
            ],
            startedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->workoutRepository->findById(id: $workoutId)->restStartedAt);

        ($this->handler)(new UpdateWorkoutCommand(
            workoutId: $workoutId,
            exercises: [],
            durationSeconds: 300,
            updatedByUserId: 'god-user-id',
            restStartedAt: $restStartedAt,
        ));

        $this->assertEquals(
            expected: $restStartedAt,
            actual: $this->workoutRepository->findById(id: $workoutId)->restStartedAt,
        );

        ($this->handler)(new UpdateWorkoutCommand(
            workoutId: $workoutId,
            exercises: [],
            durationSeconds: 360,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->workoutRepository->findById(id: $workoutId)->restStartedAt);
    }

    public function testItThrowsExceptionWhenWorkoutDoesNotExist(): void
    {
        $this->expectException(exception: UpdateWorkoutException::class);

        ($this->handler)(new UpdateWorkoutCommand(
            workoutId: 'missing-workout-id',
            exercises: [],
            durationSeconds: 100,
            updatedByUserId: 'god-user-id',
        ));
    }
}
