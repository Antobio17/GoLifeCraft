<?php

namespace App\Tests\Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Application\Command\EditWorkoutCommand;
use Gym\Training\Workout\Application\Command\EditWorkoutCommandHandler;
use Gym\Training\Workout\Application\Command\FinishWorkoutCommand;
use Gym\Training\Workout\Application\Command\FinishWorkoutCommandHandler;
use Gym\Training\Workout\Application\Command\StartWorkoutCommand;
use Gym\Training\Workout\Application\Command\StartWorkoutCommandHandler;
use Gym\Training\Workout\Application\Command\WorkoutExerciseAssembler;
use Gym\Training\Workout\Application\Command\WorkoutExerciseData;
use Gym\Training\Workout\Application\Command\WorkoutSetData;
use Gym\Training\Workout\Domain\Event\WorkoutEdited;
use Gym\Training\Workout\Domain\Event\WorkoutFinished;
use Gym\Training\Workout\Domain\Exception\EditWorkoutException;
use Gym\Training\Workout\Domain\Model\Workout;
use Gym\Training\Workout\Domain\Model\WorkoutExercise;
use Gym\Training\Workout\Domain\Model\WorkoutSet;
use Gym\Training\Workout\Infrastructure\Domain\Model\InMemory\InMemoryWorkoutRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class EditWorkoutCommandHandlerTest extends TestCase
{
    private InMemoryWorkoutRepository $workoutRepository;
    private StartWorkoutCommandHandler $startHandler;
    private FinishWorkoutCommandHandler $finishHandler;
    private EditWorkoutCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->workoutRepository = new InMemoryWorkoutRepository();
        $assembler = new WorkoutExerciseAssembler(dateTimeGenerator: $dateTimeGenerator);
        $domainEventCollectorService = new DomainEventCollectorService();
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
        $this->handler = new EditWorkoutCommandHandler(
            workoutRepository: $this->workoutRepository,
            workoutExerciseAssembler: $assembler,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItEditsTheSetsNameAndTimeOfAFinishedWorkout(): void
    {
        $workoutId = $this->finishedWorkout();

        ($this->handler)(new EditWorkoutCommand(
            workoutId: $workoutId,
            sessionName: '  Empuje B  ',
            startedAt: new \DateTime(datetime: '2026-09-20T18:30:00+02:00'),
            durationSeconds: 4500,
            exercises: [
                $this->exercise(sets: [
                    new WorkoutSetData(position: 1, reps: 12, weight: 42.5, done: true),
                    new WorkoutSetData(position: 2, reps: 8, weight: 20.0, done: false, kind: WorkoutSet::KIND_WARMUP),
                ]),
            ],
            editedByUserId: 'editor-user-id',
        ));

        $workout = $this->workoutRepository->findById(id: $workoutId);
        $this->assertSame(expected: Workout::STATUS_COMPLETED, actual: $workout->status);
        $this->assertSame(expected: 'Empuje B', actual: $workout->sessionName);
        $this->assertSame(expected: '2026-09-20 16:30:00', actual: $workout->startedAt->format(format: 'Y-m-d H:i:s'));
        $this->assertSame(expected: 'UTC', actual: $workout->startedAt->getTimezone()->getName());
        $this->assertSame(expected: '2026-09-20 17:45:00', actual: $workout->finishedAt->format(format: 'Y-m-d H:i:s'));
        $this->assertSame(expected: 4500, actual: $workout->durationSeconds);
        $this->assertSame(expected: 'editor-user-id', actual: $workout->updatedByUserId);
        $this->assertCount(expectedCount: 2, haystack: $workout->exercises[0]->sets);
        $this->assertSame(expected: 42.5, actual: $workout->exercises[0]->sets[0]->weight);
        $this->assertFalse(condition: $workout->exercises[0]->sets[1]->done);
        $this->assertSame(expected: WorkoutSet::KIND_WARMUP, actual: $workout->exercises[0]->sets[1]->kind);
    }

    public function testItRecordsTheWholeWorkoutInTheEditedEvent(): void
    {
        $workoutId = $this->finishedWorkout();
        $this->workoutRepository->findById(id: $workoutId)->pullDomainEvents();

        ($this->handler)(new EditWorkoutCommand(
            workoutId: $workoutId,
            sessionName: 'Empuje B',
            startedAt: new \DateTime(datetime: '2026-09-20T16:30:00+00:00'),
            durationSeconds: 3600,
            exercises: [$this->exercise(sets: [new WorkoutSetData(position: 1, reps: 10, weight: 50.0, done: true)])],
            editedByUserId: 'editor-user-id',
        ));

        $events = $this->workoutRepository->findById(id: $workoutId)->pullDomainEvents();

        /** @var WorkoutEdited $event */
        $event = $events[0];
        $this->assertInstanceOf(expected: WorkoutEdited::class, actual: $event);
        $this->assertSame(expected: 'session-1', actual: $event->sessionId);
        $this->assertSame(expected: 'Empuje B', actual: $event->sessionName);
        $this->assertSame(expected: Workout::STATUS_COMPLETED, actual: $event->status);
        $this->assertSame(expected: 3600, actual: $event->durationSeconds);
        $this->assertSame(expected: '2026-09-20 17:30:00', actual: $event->finishedAt->format(format: 'Y-m-d H:i:s'));
        $this->assertSame(expected: 'editor-user-id', actual: $event->updatedByUserId);
        $this->assertSame(expected: 50.0, actual: $event->exercises[0]['sets'][0]['weight']);
    }

    public function testItRefusesToEditAWorkoutInProgress(): void
    {
        $workoutId = $this->startedWorkout();

        $this->expectException(exception: EditWorkoutException::class);

        ($this->handler)($this->editCommand(workoutId: $workoutId));
    }

    public function testItThrowsExceptionWhenWorkoutDoesNotExist(): void
    {
        $this->expectException(exception: EditWorkoutException::class);

        ($this->handler)($this->editCommand(workoutId: 'missing-workout-id'));
    }

    public function testItRefusesAnEmptyName(): void
    {
        $workoutId = $this->finishedWorkout();

        $this->expectException(exception: EditWorkoutException::class);

        ($this->handler)($this->editCommand(workoutId: $workoutId, sessionName: '   '));
    }

    public function testItRefusesAStartInTheFuture(): void
    {
        $workoutId = $this->finishedWorkout();

        $this->expectException(exception: EditWorkoutException::class);

        ($this->handler)($this->editCommand(
            workoutId: $workoutId,
            startedAt: new \DateTime(datetime: '+1 day', timezone: new \DateTimeZone(timezone: 'UTC')),
        ));
    }

    public function testItRefusesANegativeDuration(): void
    {
        $workoutId = $this->finishedWorkout();

        $this->expectException(exception: EditWorkoutException::class);

        ($this->handler)($this->editCommand(workoutId: $workoutId, durationSeconds: -1));
    }

    public function testItRefusesADurationLongerThanADay(): void
    {
        $workoutId = $this->finishedWorkout();

        $this->expectException(exception: EditWorkoutException::class);

        ($this->handler)($this->editCommand(workoutId: $workoutId, durationSeconds: Workout::MAX_DURATION_SECONDS + 1));
    }

    private function editCommand(
        string $workoutId,
        string $sessionName = 'Empuje A',
        ?\DateTime $startedAt = null,
        int $durationSeconds = 3600,
    ): EditWorkoutCommand {
        return new EditWorkoutCommand(
            workoutId: $workoutId,
            sessionName: $sessionName,
            startedAt: $startedAt ?? new \DateTime(datetime: '2026-09-20T16:30:00+00:00'),
            durationSeconds: $durationSeconds,
            exercises: [],
            editedByUserId: 'editor-user-id',
        );
    }

    private function finishedWorkout(): string
    {
        $workoutId = $this->startedWorkout();

        ($this->finishHandler)(new FinishWorkoutCommand(
            workoutId: $workoutId,
            exercises: [$this->exercise(sets: [new WorkoutSetData(position: 1, reps: 10, weight: 40.0, done: true)])],
            durationSeconds: 3000,
            templateSyncMode: WorkoutFinished::TEMPLATE_SYNC_NONE,
            finishedByUserId: 'god-user-id',
        ));

        return $workoutId;
    }

    private function startedWorkout(): string
    {
        $workoutId = 'workout-1';

        ($this->startHandler)(new StartWorkoutCommand(
            workoutId: $workoutId,
            sessionId: 'session-1',
            sessionName: 'Empuje A',
            exercises: [$this->exercise(sets: [new WorkoutSetData(position: 1, reps: 10, weight: 40.0, done: false)])],
            startedByUserId: 'god-user-id',
        ));

        return $workoutId;
    }

    /**
     * @param WorkoutSetData[] $sets
     */
    private function exercise(array $sets): WorkoutExerciseData
    {
        return new WorkoutExerciseData(
            exerciseId: 'ex-1',
            exerciseName: 'Press banca',
            type: 'bilateral',
            weightMode: WorkoutExercise::WEIGHT_MODE_TOTAL,
            muscleGroups: ['Pecho'],
            position: 1,
            note: null,
            sets: $sets,
        );
    }
}
