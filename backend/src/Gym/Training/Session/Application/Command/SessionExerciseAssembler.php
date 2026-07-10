<?php

namespace Gym\Training\Session\Application\Command;

use Gym\Training\Session\Domain\Model\ExerciseSet;
use Gym\Training\Session\Domain\Model\SessionExercise;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class SessionExerciseAssembler
{
    public function __construct(
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    /**
     * @param SessionExerciseData[] $exercises
     *
     * @return SessionExercise[]
     */
    public function assemble(string $sessionId, array $exercises, string $userId): array
    {
        return array_map(
            callback: fn (SessionExerciseData $exerciseData): SessionExercise => $this->assembleExercise(
                sessionId: $sessionId,
                exerciseData: $exerciseData,
                userId: $userId,
            ),
            array: $exercises,
        );
    }

    private function assembleExercise(string $sessionId, SessionExerciseData $exerciseData, string $userId): SessionExercise
    {
        $sessionExercise = SessionExercise::create(
            sessionId: $sessionId,
            exerciseId: $exerciseData->exerciseId,
            position: $exerciseData->position,
            createdByUserId: $userId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        foreach ($exerciseData->sets as $setData) {
            $sessionExercise->addSet(exerciseSet: ExerciseSet::create(
                sessionExerciseId: $sessionExercise->id,
                position: $setData->position,
                reps: $setData->reps,
                weight: $setData->weight,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            ));
        }

        return $sessionExercise;
    }
}
