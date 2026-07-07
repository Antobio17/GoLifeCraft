<?php

namespace App\Tests\Gym\Training\Session\Application\Command;

use Gym\Training\Session\Application\Command\CreateSessionCommand;
use Gym\Training\Session\Application\Command\CreateSessionCommandHandler;
use Gym\Training\Session\Application\Command\ExerciseSetData;
use Gym\Training\Session\Application\Command\SessionExerciseAssembler;
use Gym\Training\Session\Application\Command\SessionExerciseData;
use Gym\Training\Session\Domain\Exception\CreateSessionException;
use Gym\Training\Session\Infrastructure\Domain\Model\InMemory\InMemorySessionRepository;
use Gym\Training\Session\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateSessionNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateSessionCommandHandlerTest extends TestCase
{
    private InMemorySessionRepository $sessionRepository;
    private InMemoryCreateSessionNeedleDataQuery $needleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private CreateSessionCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->sessionRepository = new InMemorySessionRepository();
        $this->needleDataQuery = new InMemoryCreateSessionNeedleDataQuery();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new CreateSessionCommandHandler(
            sessionRepository: $this->sessionRepository,
            needleDataQuery: $this->needleDataQuery,
            sessionExerciseAssembler: new SessionExerciseAssembler(dateTimeGenerator: $dateTimeGenerator),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItCreatesASessionWithExercisesAndSets(): void
    {
        ($this->handler)(new CreateSessionCommand(
            name: 'Empuje A',
            estimatedDurationMinutes: 55,
            exercises: [
                new SessionExerciseData(
                    exerciseId: null,
                    exerciseName: 'Press banca',
                    muscleGroups: ['Pecho', 'Tríceps'],
                    type: 'bilateral',
                    position: 1,
                    sets: [
                        new ExerciseSetData(position: 1, reps: 10, weight: 40.0),
                        new ExerciseSetData(position: 2, reps: 8, weight: 45.0),
                    ],
                ),
            ],
            createdByUserId: 'god-user-id',
        ));

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertNotNull(actual: $session);
        $this->assertEquals(expected: 'Empuje A', actual: $session->name);
        $this->assertCount(expectedCount: 1, haystack: $session->exercises);
        $this->assertEquals(expected: 'Press banca', actual: $session->exercises[0]->exerciseName);
        $this->assertEquals(expected: $session->id, actual: $session->exercises[0]->sessionId);
        $this->assertCount(expectedCount: 2, haystack: $session->exercises[0]->sets);
        $this->assertEquals(expected: $session->exercises[0]->id, actual: $session->exercises[0]->sets[0]->sessionExerciseId);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItThrowsExceptionWhenSessionNameAlreadyExists(): void
    {
        $this->needleDataQuery->addExistingName(name: 'Empuje A');

        $this->expectException(exception: CreateSessionException::class);

        ($this->handler)(new CreateSessionCommand(
            name: 'Empuje A',
            estimatedDurationMinutes: 55,
            exercises: [],
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsExceptionForNegativeDuration(): void
    {
        $this->expectException(exception: CreateSessionException::class);

        ($this->handler)(new CreateSessionCommand(
            name: 'Empuje A',
            estimatedDurationMinutes: -1,
            exercises: [],
            createdByUserId: 'god-user-id',
        ));
    }
}
