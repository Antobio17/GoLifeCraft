<?php

namespace Gym\Library\Exercise\Application\Command;

use Gym\Library\Exercise\Domain\Exception\DeleteExerciseException;
use Gym\Library\Exercise\Domain\Model\ExerciseRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteExerciseCommandHandler
{
    public function __construct(
        private ExerciseRepository $exerciseRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteExerciseCommand $command): void
    {
        $exercise = $this->exerciseRepository->findById(id: $command->exerciseId);
        if (null === $exercise) {
            throw DeleteExerciseException::exerciseNotFound(exerciseId: $command->exerciseId);
        }

        $exercise->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->exerciseRepository->delete(exercise: $exercise);
        $this->domainEventCollectorService->register(aggregate: $exercise);
    }
}
