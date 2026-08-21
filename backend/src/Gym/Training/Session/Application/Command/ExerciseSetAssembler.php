<?php

namespace Gym\Training\Session\Application\Command;

use Gym\Training\Session\Domain\Model\ExerciseSet;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ExerciseSetAssembler
{
    public function __construct(
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    /**
     * @param ExerciseSetData[] $sets
     *
     * @return ExerciseSet[]
     */
    public function assemble(string $sessionExerciseId, array $sets, string $userId): array
    {
        return array_map(
            callback: fn (ExerciseSetData $setData): ExerciseSet => ExerciseSet::create(
                sessionExerciseId: $sessionExerciseId,
                position: $setData->position,
                reps: $setData->reps,
                weight: $setData->weight,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            ),
            array: $sets,
        );
    }
}
