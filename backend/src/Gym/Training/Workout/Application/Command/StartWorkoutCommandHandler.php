<?php

namespace Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Domain\Exception\StartWorkoutException;
use Gym\Training\Workout\Domain\Model\Workout;
use Gym\Training\Workout\Domain\Model\WorkoutRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class StartWorkoutCommandHandler
{
    public function __construct(
        private WorkoutRepository $workoutRepository,
        private WorkoutExerciseAssembler $workoutExerciseAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(StartWorkoutCommand $command): void
    {
        if ([] === $command->exercises) {
            throw StartWorkoutException::noExercises();
        }

        $workout = Workout::start(
            id: $command->workoutId,
            sessionId: $command->sessionId,
            sessionName: $command->sessionName,
            exercises: $this->workoutExerciseAssembler->assemble(
                workoutId: $command->workoutId,
                exercises: $command->exercises,
                userId: $command->startedByUserId,
            ),
            startedByUserId: $command->startedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->workoutRepository->save(workout: $workout);
        $this->domainEventCollectorService->register(aggregate: $workout);
    }
}
