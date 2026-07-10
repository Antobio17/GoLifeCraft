<?php

namespace Gym\Training\Workout\Application\Command;

use Gym\Training\Workout\Domain\Model\WorkoutExercise;
use Gym\Training\Workout\Domain\Model\WorkoutSet;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class WorkoutExerciseAssembler
{
    public function __construct(
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    /**
     * @param WorkoutExerciseData[] $exercises
     *
     * @return WorkoutExercise[]
     */
    public function assemble(string $workoutId, array $exercises, string $userId): array
    {
        return array_map(
            callback: fn (WorkoutExerciseData $exerciseData): WorkoutExercise => $this->assembleExercise(
                workoutId: $workoutId,
                exerciseData: $exerciseData,
                userId: $userId,
            ),
            array: $exercises,
        );
    }

    private function assembleExercise(string $workoutId, WorkoutExerciseData $exerciseData, string $userId): WorkoutExercise
    {
        $workoutExercise = WorkoutExercise::create(
            workoutId: $workoutId,
            exerciseId: $exerciseData->exerciseId,
            position: $exerciseData->position,
            note: $exerciseData->note,
            createdByUserId: $userId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        foreach ($exerciseData->sets as $setData) {
            $workoutExercise->addSet(workoutSet: WorkoutSet::create(
                workoutExerciseId: $workoutExercise->id,
                position: $setData->position,
                reps: $setData->reps,
                weight: $setData->weight,
                done: $setData->done,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            ));
        }

        return $workoutExercise;
    }
}
