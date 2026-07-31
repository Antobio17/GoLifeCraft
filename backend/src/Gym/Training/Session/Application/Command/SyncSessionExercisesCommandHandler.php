<?php

namespace Gym\Training\Session\Application\Command;

use Gym\Training\Session\Domain\Model\Session;
use Gym\Training\Session\Domain\Model\SessionExercise;
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

        if (Session::SYNC_MODE_SETS === $command->mode && [] === $session->exercises) {
            return;
        }

        $exercises = $this->sessionExerciseAssembler->assemble(
            sessionId: $session->id,
            exercises: $command->exercises,
            userId: $command->updatedByUserId,
        );

        $this->applySync(
            session: $session,
            exercises: $exercises,
            mode: $command->mode,
            updatedByUserId: $command->updatedByUserId,
        );

        $this->sessionRepository->save(session: $session);
        $this->domainEventCollectorService->register(aggregate: $session);
    }

    /**
     * @param SessionExercise[] $exercises
     */
    private function applySync(Session $session, array $exercises, string $mode, string $updatedByUserId): void
    {
        if (Session::SYNC_MODE_SETS === $mode) {
            $session->syncExerciseSets(
                exercises: $exercises,
                updatedByUserId: $updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            return;
        }

        $session->syncExercises(
            exercises: $exercises,
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }
}
