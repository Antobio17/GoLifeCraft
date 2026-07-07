<?php

namespace Gym\Training\Session\Application\Command;

use Gym\Training\Session\Domain\Exception\CreateSessionException;
use Gym\Training\Session\Domain\Model\Session;
use Gym\Training\Session\Domain\Model\SessionRepository;
use Gym\Training\Session\Domain\QueryModel\CreateSessionNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateSessionCommandHandler
{
    public function __construct(
        private SessionRepository $sessionRepository,
        private CreateSessionNeedleDataQuery $needleDataQuery,
        private SessionExerciseAssembler $sessionExerciseAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateSessionCommand $command): void
    {
        if ($this->needleDataQuery->sessionWithNameAlreadyExists(name: $command->name)) {
            throw CreateSessionException::sessionWithNameAlreadyExists(name: $command->name);
        }

        $sessionId = $this->sessionRepository->nextId();

        $session = Session::create(
            id: $sessionId,
            name: $command->name,
            estimatedDurationMinutes: $command->estimatedDurationMinutes,
            exercises: $this->sessionExerciseAssembler->assemble(
                sessionId: $sessionId,
                exercises: $command->exercises,
                userId: $command->createdByUserId,
            ),
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->sessionRepository->save(session: $session);
        $this->domainEventCollectorService->register(aggregate: $session);
    }
}
