<?php

namespace Gym\Training\Workout\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetWorkoutException extends BaseException
{
    public static function notFound(string $workoutId): self
    {
        return new static(
            title: 'Workout does not exist.',
            keyTranslation: 'workout.does.not.exist',
            details: ['workoutId' => $workoutId]
        );
    }

    public static function noActiveWorkout(): self
    {
        return new static(
            title: 'There is no active workout.',
            keyTranslation: 'workout.no.active',
            details: []
        );
    }
}
