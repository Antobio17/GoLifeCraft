<?php

namespace Gym\Training\Session\Application\Command;

use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Gym\Training\Session\Domain\Model\SessionRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateSessionExerciseCommandHandler
{
    public function __construct(
        private SessionRepository $sessionRepository,
        private ExerciseSetAssembler $exerciseSetAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateSessionExerciseCommand $command): void
    {
        $session = $this->sessionRepository->findById(id: $command->sessionId);
        if (null === $session) {
            throw UpdateSessionException::sessionNotFound(sessionId: $command->sessionId);
        }

        $session->updateExercise(
            sessionExerciseId: $command->sessionExerciseId,
            note: $command->note,
            sets: $this->exerciseSetAssembler->assemble(
                sessionExerciseId: $command->sessionExerciseId,
                sets: $command->sets,
                userId: $command->updatedByUserId,
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->sessionRepository->save(session: $session);
        $this->domainEventCollectorService->register(aggregate: $session);
    }
}
