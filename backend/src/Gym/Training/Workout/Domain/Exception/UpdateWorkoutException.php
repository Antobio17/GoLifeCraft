<?php

namespace Gym\Training\Workout\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateWorkoutException extends BaseException
{
    public static function workoutNotFound(string $workoutId): self
    {
        return new static(
            title: 'Workout does not exist.',
            keyTranslation: 'workout.does.not.exist',
            details: ['workoutId' => $workoutId]
        );
    }

    public static function workoutAlreadyFinished(string $workoutId): self
    {
        return new static(
            title: 'This workout is already finished.',
            keyTranslation: 'workout.already.finished',
            details: ['workoutId' => $workoutId]
        );
    }

    public static function invalidSetKind(string $kind): self
    {
        return new static(
            title: 'The kind of the set is not supported.',
            keyTranslation: 'workout.set.kind.invalid',
            details: ['kind' => $kind]
        );
    }
}
