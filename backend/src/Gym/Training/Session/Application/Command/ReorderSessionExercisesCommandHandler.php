<?php

namespace Gym\Training\Session\Application\Command;

use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Gym\Training\Session\Domain\Model\SessionRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ReorderSessionExercisesCommandHandler
{
    public function __construct(
        private SessionRepository $sessionRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ReorderSessionExercisesCommand $command): void
    {
        $session = $this->sessionRepository->findById(id: $command->sessionId);
        if (null === $session) {
            throw UpdateSessionException::sessionNotFound(sessionId: $command->sessionId);
        }

        if ($session->exerciseIds() === $command->orderedSessionExerciseIds) {
            return;
        }

        $session->reorderExercises(
            orderedSessionExerciseIds: $command->orderedSessionExerciseIds,
            reorderedByUserId: $command->reorderedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->sessionRepository->save(session: $session);
        $this->domainEventCollectorService->register(aggregate: $session);
    }
}
