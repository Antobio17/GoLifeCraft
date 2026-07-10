<?php

namespace App\Tests\Gym\Training\Session\Application\Command;

use Gym\Training\Session\Application\Command\CreateSessionCommand;
use Gym\Training\Session\Application\Command\CreateSessionCommandHandler;
use Gym\Training\Session\Application\Command\DeleteSessionCommand;
use Gym\Training\Session\Application\Command\DeleteSessionCommandHandler;
use Gym\Training\Session\Application\Command\ExerciseSetData;
use Gym\Training\Session\Application\Command\SessionExerciseAssembler;
use Gym\Training\Session\Application\Command\SessionExerciseData;
use Gym\Training\Session\Domain\Exception\DeleteSessionException;
use Gym\Training\Session\Infrastructure\Domain\Model\InMemory\InMemorySessionRepository;
use Gym\Training\Session\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateSessionNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteSessionCommandHandlerTest extends TestCase
{
    private InMemorySessionRepository $sessionRepository;
    private DeleteSessionCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $domainEventCollectorService = new DomainEventCollectorService();
        $this->sessionRepository = new InMemorySessionRepository();

        $createHandler = new CreateSessionCommandHandler(
            sessionRepository: $this->sessionRepository,
            needleDataQuery: new InMemoryCreateSessionNeedleDataQuery(),
            sessionExerciseAssembler: new SessionExerciseAssembler(dateTimeGenerator: $dateTimeGenerator),
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

        $this->handler = new DeleteSessionCommandHandler(
            sessionRepository: $this->sessionRepository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItDeletesSession(): void
    {
        ($this->handler)(new DeleteSessionCommand(
            sessionId: 'session-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->sessionRepository->findById(id: 'session-1'));
    }

    public function testItThrowsExceptionWhenSessionNotFound(): void
    {
        $this->expectException(exception: DeleteSessionException::class);

        ($this->handler)(new DeleteSessionCommand(
            sessionId: 'missing-id',
            deletedByUserId: 'god-user-id',
        ));
    }
}
