<?php

namespace Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Domain\Exception\EditWorkoutException;
use Gym\Training\Workout\Domain\Model\WorkoutRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class EditWorkoutCommandHandler
{
    public function __construct(
        private WorkoutRepository $workoutRepository,
        private WorkoutExerciseAssembler $workoutExerciseAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(EditWorkoutCommand $command): void
    {
        $workout = $this->workoutRepository->findById(id: $command->workoutId);
        if (null === $workout) {
            throw EditWorkoutException::workoutNotFound(workoutId: $command->workoutId);
        }

        $workout->edit(
            sessionName: $command->sessionName,
            startedAt: $command->startedAt,
            durationSeconds: $command->durationSeconds,
            exercises: $this->workoutExerciseAssembler->assemble(
                workoutId: $workout->id,
                exercises: $command->exercises,
                userId: $command->editedByUserId,
            ),
            editedByUserId: $command->editedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->workoutRepository->save(workout: $workout);
        $this->domainEventCollectorService->register(aggregate: $workout);
    }
}
