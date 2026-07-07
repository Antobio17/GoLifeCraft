<?php

namespace Gym\Library\Exercise\Domain\Exception;

use Gym\Library\Exercise\Domain\Model\Exercise;
use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateExerciseException extends BaseException
{
    public static function exerciseNotFound(string $exerciseId): self
    {
        return new static(
            title: 'Exercise does not exist.',
            keyTranslation: 'exercise.does.not.exist',
            details: ['exerciseId' => $exerciseId]
        );
    }

    public static function typeIsNotAvailable(string $type): self
    {
        return new static(
            title: 'The exercise type does not exist.',
            keyTranslation: 'exercise.type.does.not.exist',
            details: [
                'type' => $type,
                'availableTypes' => Exercise::AVAILABLE_TYPES,
            ]
        );
    }

    public static function atLeastOneMuscleGroupRequired(): self
    {
        return new static(
            title: 'The exercise must have at least one muscle group.',
            keyTranslation: 'exercise.at.least.one.muscle.group.required',
            details: []
        );
    }
}
