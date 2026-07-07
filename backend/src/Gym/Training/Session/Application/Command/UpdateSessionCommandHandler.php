<?php

namespace Gym\Training\Session\Application\Command;

use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Gym\Training\Session\Domain\Model\SessionRepository;
use Gym\Training\Session\Domain\QueryModel\UpdateSessionNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateSessionCommandHandler
{
    public function __construct(
        private SessionRepository $sessionRepository,
        private UpdateSessionNeedleDataQuery $needleDataQuery,
        private SessionExerciseAssembler $sessionExerciseAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateSessionCommand $command): void
    {
        $session = $this->sessionRepository->findById(id: $command->sessionId);
        if (null === $session) {
            throw UpdateSessionException::sessionNotFound(sessionId: $command->sessionId);
        }

        $nameAlreadyExists = $this->needleDataQuery->sessionWithNameAlreadyExists(
            name: $command->name,
            excludingSessionId: $command->sessionId,
        );
        if ($nameAlreadyExists) {
            throw UpdateSessionException::sessionWithNameAlreadyExists(name: $command->name);
        }

        $session->update(
            name: $command->name,
            estimatedDurationMinutes: $command->estimatedDurationMinutes,
            exercises: $this->sessionExerciseAssembler->assemble(
                sessionId: $session->id,
                exercises: $command->exercises,
                userId: $command->updatedByUserId,
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->sessionRepository->save(session: $session);
        $this->domainEventCollectorService->register(aggregate: $session);
    }
}
