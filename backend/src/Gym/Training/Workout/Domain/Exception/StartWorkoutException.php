<?php

namespace Gym\Training\Workout\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class StartWorkoutException extends BaseException
{
    public static function noExercises(): self
    {
        return new static(
            title: 'A workout must contain at least one exercise.',
            keyTranslation: 'workout.must.contain.exercises',
            details: []
        );
    }
}
