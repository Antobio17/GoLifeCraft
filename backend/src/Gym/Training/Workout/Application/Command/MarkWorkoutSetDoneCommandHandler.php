<?php

namespace Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Domain\Exception\MarkWorkoutSetDoneException;
use Gym\Training\Workout\Domain\Model\WorkoutRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class MarkWorkoutSetDoneCommandHandler
{
    public function __construct(
        private WorkoutRepository $workoutRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(MarkWorkoutSetDoneCommand $command): void
    {
        $workout = $this->workoutRepository->findById(id: $command->workoutId);
        if (null === $workout) {
            throw MarkWorkoutSetDoneException::workoutNotFound(workoutId: $command->workoutId);
        }

        $workout->markSetDone(
            setId: $command->setId,
            done: $command->done,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->workoutRepository->save(workout: $workout);
        $this->domainEventCollectorService->register(aggregate: $workout);
    }
}
