<?php

namespace Gym\Library\Exercise\Application\Command;

use Gym\Library\Exercise\Domain\Exception\CreateExerciseException;
use Gym\Library\Exercise\Domain\Exception\UpdateExerciseException;
use Gym\Library\Exercise\Domain\Model\ExerciseRepository;
use Gym\Library\Exercise\Domain\QueryModel\UpdateExerciseNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateExerciseCommandHandler
{
    public function __construct(
        private ExerciseRepository $exerciseRepository,
        private UpdateExerciseNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateExerciseCommand $command): void
    {
        $exercise = $this->exerciseRepository->findById(id: $command->exerciseId);
        if (null === $exercise) {
            throw UpdateExerciseException::exerciseNotFound(exerciseId: $command->exerciseId);
        }

        $nameAlreadyExists = $this->needleDataQuery->exerciseWithNameAlreadyExists(
            name: $command->name,
            excludingExerciseId: $command->exerciseId,
        );
        if ($nameAlreadyExists) {
            throw CreateExerciseException::exerciseWithNameAlreadyExists(name: $command->name);
        }

        $exercise->update(
            name: $command->name,
            description: $command->description,
            type: $command->type,
            muscleGroups: $command->muscleGroups,
            icon: $command->icon,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->exerciseRepository->save(exercise: $exercise);
        $this->domainEventCollectorService->register(aggregate: $exercise);
    }
}
