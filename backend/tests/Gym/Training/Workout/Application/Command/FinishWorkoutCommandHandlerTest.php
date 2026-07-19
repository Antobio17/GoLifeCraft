<?php

namespace App\Tests\Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Application\Command\FinishWorkoutCommand;
use Gym\Training\Workout\Application\Command\FinishWorkoutCommandHandler;
use Gym\Training\Workout\Application\Command\StartWorkoutCommand;
use Gym\Training\Workout\Application\Command\StartWorkoutCommandHandler;
use Gym\Training\Workout\Application\Command\WorkoutExerciseAssembler;
use Gym\Training\Workout\Application\Command\WorkoutExerciseData;
use Gym\Training\Workout\Application\Command\WorkoutSetData;
use Gym\Training\Workout\Domain\Exception\FinishWorkoutException;
use Gym\Training\Workout\Domain\Model\Workout;
use Gym\Training\Workout\Infrastructure\Domain\Model\InMemory\InMemoryWorkoutRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class FinishWorkoutCommandHandlerTest extends TestCase
{
    private InMemoryWorkoutRepository $workoutRepository;
    private WorkoutExerciseAssembler $assembler;
    private DomainEventCollectorService $domainEventCollectorService;
    private StartWorkoutCommandHandler $startHandler;
    private FinishWorkoutCommandHandler $handler;

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
        $this->handler = new FinishWorkoutCommandHandler(
            workoutRepository: $this->workoutRepository,
            workoutExerciseAssembler: $this->assembler,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItFinishesAnActiveWorkout(): void
    {
        $workoutId = $this->startActiveWorkout();

        ($this->handler)(new FinishWorkoutCommand(
            workoutId: $workoutId,
            exercises: [
                new WorkoutExerciseData(
                    exerciseId: 'ex-1',
                    exerciseName: 'Press banca',
                    type: 'bilateral',
                    muscleGroups: ['Pecho', 'Tríceps'],
                    position: 1,
                    note: null,
                    sets: [
                        new WorkoutSetData(position: 1, reps: 10, weight: 40.0, done: true),
                    ],
                ),
            ],
            durationSeconds: 3600,
            finishedByUserId: 'god-user-id',
        ));

        $workout = $this->workoutRepository->findById(id: $workoutId);
        $this->assertEquals(expected: Workout::STATUS_COMPLETED, actual: $workout->status);
        $this->assertNotNull(actual: $workout->finishedAt);
        $this->assertEquals(expected: 3600, actual: $workout->durationSeconds);
        $this->assertTrue(condition: $workout->exercises[0]->sets[0]->done);
    }

    public function testItThrowsExceptionWhenWorkoutDoesNotExist(): void
    {
        $this->expectException(exception: FinishWorkoutException::class);

        ($this->handler)(new FinishWorkoutCommand(
            workoutId: 'missing-workout-id',
            exercises: [],
            durationSeconds: 100,
            finishedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsExceptionWhenWorkoutAlreadyFinished(): void
    {
        $workoutId = $this->startActiveWorkout();

        $finishCommand = new FinishWorkoutCommand(
            workoutId: $workoutId,
            exercises: [],
            durationSeconds: 3600,
            finishedByUserId: 'god-user-id',
        );

        ($this->handler)($finishCommand);

        $this->expectException(exception: FinishWorkoutException::class);
        ($this->handler)($finishCommand);
    }

    private function startActiveWorkout(): string
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

        return $workoutId;
    }
}
