<?php

namespace App\Tests\Gym\Training\Session\Application\Command;

use Gym\Training\Session\Application\Command\CreateSessionCommand;
use Gym\Training\Session\Application\Command\CreateSessionCommandHandler;
use Gym\Training\Session\Application\Command\ExerciseSetData;
use Gym\Training\Session\Application\Command\SessionExerciseAssembler;
use Gym\Training\Session\Application\Command\SessionExerciseData;
use Gym\Training\Session\Application\Command\SyncSessionExercisesCommand;
use Gym\Training\Session\Application\Command\SyncSessionExercisesCommandHandler;
use Gym\Training\Session\Infrastructure\Domain\Model\InMemory\InMemorySessionRepository;
use Gym\Training\Session\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateSessionNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class SyncSessionExercisesCommandHandlerTest extends TestCase
{
    private InMemorySessionRepository $sessionRepository;
    private SyncSessionExercisesCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $assembler = new SessionExerciseAssembler(dateTimeGenerator: $dateTimeGenerator);
        $domainEventCollectorService = new DomainEventCollectorService();
        $this->sessionRepository = new InMemorySessionRepository();

        $createHandler = new CreateSessionCommandHandler(
            sessionRepository: $this->sessionRepository,
            needleDataQuery: new InMemoryCreateSessionNeedleDataQuery(),
            sessionExerciseAssembler: $assembler,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        ($createHandler)(new CreateSessionCommand(
            name: 'Empuje A',
            estimatedDurationMinutes: 55,
            exercises: [
                new SessionExerciseData(
                    exerciseId: 'exercise-1',
                    position: 1,
                    sets: [new ExerciseSetData(position: 1, reps: 10, weight: 40.0)],
                ),
            ],
            createdByUserId: 'god-user-id',
        ));

        $this->handler = new SyncSessionExercisesCommandHandler(
            sessionRepository: $this->sessionRepository,
            sessionExerciseAssembler: $assembler,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItReplacesExercisesWhilePreservingNameAndDuration(): void
    {
        ($this->handler)(new SyncSessionExercisesCommand(
            sessionId: 'session-1',
            exercises: [
                new SessionExerciseData(
                    exerciseId: 'exercise-2',
                    position: 1,
                    sets: [
                        new ExerciseSetData(position: 1, reps: 12, weight: 20.0),
                        new ExerciseSetData(position: 2, reps: 12, weight: 22.5),
                    ],
                ),
            ],
            updatedByUserId: 'god-user-id',
        ));

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertEquals(expected: 'Empuje A', actual: $session->name);
        $this->assertEquals(expected: 55, actual: $session->estimatedDurationMinutes);
        $this->assertCount(expectedCount: 1, haystack: $session->exercises);
        $this->assertEquals(expected: 'exercise-2', actual: $session->exercises[0]->exerciseId);
        $this->assertCount(expectedCount: 2, haystack: $session->exercises[0]->sets);
    }

    public function testItDoesNothingWhenSessionNotFound(): void
    {
        ($this->handler)(new SyncSessionExercisesCommand(
            sessionId: 'missing-id',
            exercises: [],
            updatedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->sessionRepository->findById(id: 'missing-id'));
    }
}
