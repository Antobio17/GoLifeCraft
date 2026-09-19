<?php

namespace App\Tests\Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Application\Command\FinishWorkoutCommand;
use Gym\Training\Workout\Application\Command\FinishWorkoutCommandHandler;
use Gym\Training\Workout\Application\Command\MarkWorkoutSetDoneCommand;
use Gym\Training\Workout\Application\Command\MarkWorkoutSetDoneCommandHandler;
use Gym\Training\Workout\Application\Command\StartWorkoutCommand;
use Gym\Training\Workout\Application\Command\StartWorkoutCommandHandler;
use Gym\Training\Workout\Application\Command\WorkoutExerciseAssembler;
use Gym\Training\Workout\Application\Command\WorkoutExerciseData;
use Gym\Training\Workout\Application\Command\WorkoutSetData;
use Gym\Training\Workout\Domain\Event\WorkoutSetMarkedDone;
use Gym\Training\Workout\Domain\Exception\MarkWorkoutSetDoneException;
use Gym\Training\Workout\Domain\Model\Workout;
use Gym\Training\Workout\Infrastructure\Domain\Model\InMemory\InMemoryWorkoutRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class MarkWorkoutSetDoneCommandHandlerTest extends TestCase
{
    private InMemoryWorkoutRepository $workoutRepository;
    private StartWorkoutCommandHandler $startHandler;
    private FinishWorkoutCommandHandler $finishHandler;
    private MarkWorkoutSetDoneCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $assembler = new WorkoutExerciseAssembler(dateTimeGenerator: $dateTimeGenerator);
        $domainEventCollectorService = new DomainEventCollectorService();
        $this->workoutRepository = new InMemoryWorkoutRepository();
        $this->startHandler = new StartWorkoutCommandHandler(
            workoutRepository: $this->workoutRepository,
            workoutExerciseAssembler: $assembler,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->finishHandler = new FinishWorkoutCommandHandler(
            workoutRepository: $this->workoutRepository,
            workoutExerciseAssembler: $assembler,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->handler = new MarkWorkoutSetDoneCommandHandler(
            workoutRepository: $this->workoutRepository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItTicksAForgottenSetOfAFinishedWorkout(): void
    {
        $workoutId = $this->finishedWorkout();
        $setId = $this->workoutRepository->findById(id: $workoutId)->exercises[0]->sets[1]->id;

        ($this->handler)(new MarkWorkoutSetDoneCommand(
            workoutId: $workoutId,
            setId: $setId,
            done: true,
            updatedByUserId: 'god-user-id',
        ));

        $sets = $this->workoutRepository->findById(id: $workoutId)->exercises[0]->sets;
        $this->assertTrue(condition: $sets[0]->done);
        $this->assertTrue(condition: $sets[1]->done);
        $this->assertSame(expected: 'god-user-id', actual: $sets[1]->updatedByUserId);
    }

    public function testItUnticksASetThatWasNeverLifted(): void
    {
        $workoutId = $this->finishedWorkout();
        $setId = $this->workoutRepository->findById(id: $workoutId)->exercises[0]->sets[0]->id;

        ($this->handler)(new MarkWorkoutSetDoneCommand(
            workoutId: $workoutId,
            setId: $setId,
            done: false,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertFalse(condition: $this->workoutRepository->findById(id: $workoutId)->exercises[0]->sets[0]->done);
    }

    public function testItRecordsTheWholeWorkoutInTheEvent(): void
    {
        $workoutId = $this->finishedWorkout();
        $workout = $this->workoutRepository->findById(id: $workoutId);
        $workout->pullDomainEvents();
        $setId = $workout->exercises[0]->sets[1]->id;

        ($this->handler)(new MarkWorkoutSetDoneCommand(
            workoutId: $workoutId,
            setId: $setId,
            done: true,
            updatedByUserId: 'god-user-id',
        ));

        /** @var WorkoutSetMarkedDone $event */
        $event = $this->workoutRepository->findById(id: $workoutId)->pullDomainEvents()[0];

        $this->assertInstanceOf(expected: WorkoutSetMarkedDone::class, actual: $event);
        $this->assertSame(expected: $workoutId, actual: $event->aggregateId);
        $this->assertSame(expected: $setId, actual: $event->setId);
        $this->assertTrue(condition: $event->done);
        $this->assertSame(expected: Workout::STATUS_COMPLETED, actual: $event->status);
        $this->assertSame(expected: 'session-1', actual: $event->sessionId);
        $this->assertCount(expectedCount: 1, haystack: $event->exercises);
        $this->assertTrue(condition: $event->exercises[0]['sets'][1]['done']);
    }

    public function testItRefusesAWorkoutStillInProgress(): void
    {
        $workoutId = $this->startedWorkout();
        $setId = $this->workoutRepository->findById(id: $workoutId)->exercises[0]->sets[1]->id;

        $this->expectException(exception: MarkWorkoutSetDoneException::class);

        ($this->handler)(new MarkWorkoutSetDoneCommand(
            workoutId: $workoutId,
            setId: $setId,
            done: true,
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesASetOfAnotherWorkout(): void
    {
        $workoutId = $this->finishedWorkout();

        $this->expectException(exception: MarkWorkoutSetDoneException::class);

        ($this->handler)(new MarkWorkoutSetDoneCommand(
            workoutId: $workoutId,
            setId: 'set-from-somewhere-else',
            done: true,
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAWorkoutThatDoesNotExist(): void
    {
        $this->expectException(exception: MarkWorkoutSetDoneException::class);

        ($this->handler)(new MarkWorkoutSetDoneCommand(
            workoutId: 'missing-workout-id',
            setId: 'any-set-id',
            done: true,
            updatedByUserId: 'god-user-id',
        ));
    }

    private function startedWorkout(): string
    {
        $workoutId = 'workout-'.uniqid();

        ($this->startHandler)(new StartWorkoutCommand(
            workoutId: $workoutId,
            sessionId: 'session-1',
            sessionName: 'Empuje A',
            exercises: $this->exercises(),
            startedByUserId: 'god-user-id',
        ));

        return $workoutId;
    }

    private function finishedWorkout(): string
    {
        $workoutId = $this->startedWorkout();

        ($this->finishHandler)(new FinishWorkoutCommand(
            workoutId: $workoutId,
            exercises: $this->exercises(),
            durationSeconds: 3600,
            templateSyncMode: 'none',
            finishedByUserId: 'god-user-id',
        ));

        return $workoutId;
    }

    /**
     * @return WorkoutExerciseData[]
     */
    private function exercises(): array
    {
        return [
            new WorkoutExerciseData(
                exerciseId: 'ex-1',
                exerciseName: 'Press banca',
                type: 'bilateral',
                muscleGroups: ['Pecho'],
                position: 1,
                note: null,
                sets: [
                    new WorkoutSetData(position: 1, reps: 10, weight: 40.0, done: true),
                    new WorkoutSetData(position: 2, reps: 10, weight: 40.0, done: false),
                ],
            ),
        ];
    }
}
