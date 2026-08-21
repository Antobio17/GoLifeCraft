<?php

namespace Gym\Training\Session\Application\Command;

use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Gym\Training\Session\Domain\Model\SessionExercise;
use Gym\Training\Session\Domain\Model\SessionRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class AddSessionExerciseCommandHandler
{
    public function __construct(
        private SessionRepository $sessionRepository,
        private ExerciseSetAssembler $exerciseSetAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(AddSessionExerciseCommand $command): void
    {
        $session = $this->sessionRepository->findById(id: $command->sessionId);
        if (null === $session) {
            throw UpdateSessionException::sessionNotFound(sessionId: $command->sessionId);
        }

        if (null !== $session->findExercise(sessionExerciseId: $command->sessionExerciseId)) {
            return;
        }

        $sessionExercise = SessionExercise::createWithId(
            id: $command->sessionExerciseId,
            sessionId: $session->id,
            exerciseId: $command->exerciseId,
            position: $session->nextExercisePosition(),
            note: $command->note,
            createdByUserId: $command->addedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        foreach ($this->exerciseSetAssembler->assemble(
            sessionExerciseId: $sessionExercise->id,
            sets: $command->sets,
            userId: $command->addedByUserId,
        ) as $exerciseSet) {
            $sessionExercise->addSet(exerciseSet: $exerciseSet);
        }

        $session->addExercise(
            sessionExercise: $sessionExercise,
            addedByUserId: $command->addedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->sessionRepository->save(session: $session);
        $this->domainEventCollectorService->register(aggregate: $session);
    }
}
