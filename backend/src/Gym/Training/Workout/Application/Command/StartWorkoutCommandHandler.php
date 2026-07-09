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

    public function __invoke(StartWorkoutCommand $command): string
    {
        if ([] === $command->exercises) {
            throw StartWorkoutException::noExercises();
        }

        $workoutId = $this->workoutRepository->nextId();

        $workout = Workout::start(
            id: $workoutId,
            sessionId: $command->sessionId,
            sessionName: $command->sessionName,
            exercises: $this->workoutExerciseAssembler->assemble(
                workoutId: $workoutId,
                exercises: $command->exercises,
                userId: $command->startedByUserId,
            ),
            startedByUserId: $command->startedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->workoutRepository->save(workout: $workout);
        $this->domainEventCollectorService->register(aggregate: $workout);

        return $workoutId;
    }
}
