<?php

namespace Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Domain\Exception\FinishWorkoutException;
use Gym\Training\Workout\Domain\Model\WorkoutRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class FinishWorkoutCommandHandler
{
    public function __construct(
        private WorkoutRepository $workoutRepository,
        private WorkoutExerciseAssembler $workoutExerciseAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(FinishWorkoutCommand $command): void
    {
        $workout = $this->workoutRepository->findById(id: $command->workoutId);
        if (null === $workout) {
            throw FinishWorkoutException::workoutNotFound(workoutId: $command->workoutId);
        }

        $workout->finish(
            exercises: $this->workoutExerciseAssembler->assemble(
                workoutId: $workout->id,
                exercises: $command->exercises,
                userId: $command->finishedByUserId,
            ),
            durationSeconds: $command->durationSeconds,
            finishedByUserId: $command->finishedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->workoutRepository->save(workout: $workout);
        $this->domainEventCollectorService->register(aggregate: $workout);
    }
}
