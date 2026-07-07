<?php

namespace Gym\Library\Exercise\Domain\Exception;

use Gym\Library\Exercise\Domain\Model\Exercise;
use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CreateExerciseException extends BaseException
{
    public static function exerciseWithNameAlreadyExists(string $name): self
    {
        return new static(
            title: 'Exercise with this name already exists.',
            keyTranslation: 'exercise.with.name.already.exists',
            details: ['name' => $name]
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
