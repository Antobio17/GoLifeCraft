<?php

namespace Gym\Training\Session\Application\Command;

use Gym\Training\Session\Domain\Model\SessionRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class SyncSessionExercisesCommandHandler
{
    public function __construct(
        private SessionRepository $sessionRepository,
        private SessionExerciseAssembler $sessionExerciseAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(SyncSessionExercisesCommand $command): void
    {
        $session = $this->sessionRepository->findById(id: $command->sessionId);
        if (null === $session) {
            return;
        }

        $session->syncExercises(
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
