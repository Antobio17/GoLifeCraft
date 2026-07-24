<?php

namespace Gym\Library\Exercise\Application\Command;

use Gym\Library\Exercise\Domain\Exception\CreateExerciseException;
use Gym\Library\Exercise\Domain\Model\Exercise;
use Gym\Library\Exercise\Domain\Model\ExerciseRepository;
use Gym\Library\Exercise\Domain\QueryModel\CreateExerciseNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateExerciseCommandHandler
{
    public function __construct(
        private ExerciseRepository $exerciseRepository,
        private CreateExerciseNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateExerciseCommand $command): void
    {
        if ($this->needleDataQuery->exerciseWithNameAlreadyExists(name: $command->name)) {
            throw CreateExerciseException::exerciseWithNameAlreadyExists(name: $command->name);
        }

        $exercise = Exercise::create(
            id: $this->exerciseRepository->nextId(),
            name: $command->name,
            description: $command->description,
            type: $command->type,
            muscleGroups: $command->muscleGroups,
            icon: $command->icon,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->exerciseRepository->save(exercise: $exercise);
        $this->domainEventCollectorService->register(aggregate: $exercise);
    }
}
