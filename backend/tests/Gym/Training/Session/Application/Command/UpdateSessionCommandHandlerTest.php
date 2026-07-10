<?php

namespace App\Tests\Gym\Training\Session\Application\Command;

use Gym\Training\Session\Application\Command\CreateSessionCommand;
use Gym\Training\Session\Application\Command\CreateSessionCommandHandler;
use Gym\Training\Session\Application\Command\ExerciseSetData;
use Gym\Training\Session\Application\Command\SessionExerciseAssembler;
use Gym\Training\Session\Application\Command\SessionExerciseData;
use Gym\Training\Session\Application\Command\UpdateSessionCommand;
use Gym\Training\Session\Application\Command\UpdateSessionCommandHandler;
use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Gym\Training\Session\Infrastructure\Domain\Model\InMemory\InMemorySessionRepository;
use Gym\Training\Session\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateSessionNeedleDataQuery;
use Gym\Training\Session\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateSessionNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateSessionCommandHandlerTest extends TestCase
{
    private InMemorySessionRepository $sessionRepository;
    private InMemoryUpdateSessionNeedleDataQuery $needleDataQuery;
    private UpdateSessionCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $assembler = new SessionExerciseAssembler(dateTimeGenerator: $dateTimeGenerator);
        $domainEventCollectorService = new DomainEventCollectorService();
        $this->sessionRepository = new InMemorySessionRepository();
        $this->needleDataQuery = new InMemoryUpdateSessionNeedleDataQuery();

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
                    sets: [
                        new ExerciseSetData(position: 1, reps: 10, weight: 40.0),
                        new ExerciseSetData(position: 2, reps: 8, weight: 45.0),
                    ],
                ),
            ],
            createdByUserId: 'god-user-id',
        ));

        $this->needleDataQuery->addExistingName(sessionId: 'session-1', name: 'Empuje A');

        $this->handler = new UpdateSessionCommandHandler(
            sessionRepository: $this->sessionRepository,
            needleDataQuery: $this->needleDataQuery,
            sessionExerciseAssembler: $assembler,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItReplacesExercisesOnUpdate(): void
    {
        ($this->handler)(new UpdateSessionCommand(
            sessionId: 'session-1',
            name: 'Empuje B',
            estimatedDurationMinutes: 50,
            exercises: [
                new SessionExerciseData(
                    exerciseId: 'exercise-2',
                    position: 1,
                    sets: [new ExerciseSetData(position: 1, reps: 12, weight: 20.0)],
                ),
            ],
            updatedByUserId: 'god-user-id',
        ));

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertEquals(expected: 'Empuje B', actual: $session->name);
        $this->assertCount(expectedCount: 1, haystack: $session->exercises);
        $this->assertEquals(expected: 'exercise-2', actual: $session->exercises[0]->exerciseId);
        $this->assertCount(expectedCount: 1, haystack: $session->exercises[0]->sets);
    }

    public function testItThrowsExceptionWhenAnotherSessionHasTheSameName(): void
    {
        $this->needleDataQuery->addExistingName(sessionId: 'session-2', name: 'Piernas');

        $this->expectException(exception: UpdateSessionException::class);

        ($this->handler)(new UpdateSessionCommand(
            sessionId: 'session-1',
            name: 'Piernas',
            estimatedDurationMinutes: 50,
            exercises: [],
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsExceptionWhenSessionNotFound(): void
    {
        $this->expectException(exception: UpdateSessionException::class);

        ($this->handler)(new UpdateSessionCommand(
            sessionId: 'missing-id',
            name: 'Empuje B',
            estimatedDurationMinutes: 50,
            exercises: [],
            updatedByUserId: 'god-user-id',
        ));
    }
}
