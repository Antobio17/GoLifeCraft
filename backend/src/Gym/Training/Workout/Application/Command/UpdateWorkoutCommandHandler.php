<?php

namespace Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Domain\Exception\UpdateWorkoutException;
use Gym\Training\Workout\Domain\Model\WorkoutRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateWorkoutCommandHandler
{
    public function __construct(
        private WorkoutRepository $workoutRepository,
        private WorkoutExerciseAssembler $workoutExerciseAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateWorkoutCommand $command): void
    {
        $workout = $this->workoutRepository->findById(id: $command->workoutId);
        if (null === $workout) {
            throw UpdateWorkoutException::workoutNotFound(workoutId: $command->workoutId);
        }

        $workout->saveProgress(
            exercises: $this->workoutExerciseAssembler->assemble(
                workoutId: $workout->id,
                exercises: $command->exercises,
                userId: $command->updatedByUserId,
            ),
            durationSeconds: $command->durationSeconds,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->workoutRepository->save(workout: $workout);
        $this->domainEventCollectorService->register(aggregate: $workout);
    }
}
