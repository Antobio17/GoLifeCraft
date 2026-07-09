<?php

namespace Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Domain\Exception\DiscardWorkoutException;
use Gym\Training\Workout\Domain\Model\Workout;
use Gym\Training\Workout\Domain\Model\WorkoutRepository;

final readonly class DiscardWorkoutCommandHandler
{
    public function __construct(
        private WorkoutRepository $workoutRepository,
    ) {
    }

    public function __invoke(DiscardWorkoutCommand $command): void
    {
        $workout = $this->workoutRepository->findById(id: $command->workoutId);
        if (null === $workout) {
            throw DiscardWorkoutException::workoutNotFound(workoutId: $command->workoutId);
        }

        if (Workout::STATUS_COMPLETED === $workout->status) {
            throw DiscardWorkoutException::workoutAlreadyFinished(workoutId: $command->workoutId);
        }

        $this->workoutRepository->delete(workout: $workout);
    }
}
