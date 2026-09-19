<?php

namespace Gym\Training\Workout\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class MarkWorkoutSetDoneException extends BaseException
{
    public static function workoutNotFound(string $workoutId): self
    {
        return new static(
            title: 'Workout does not exist.',
            keyTranslation: 'workout.does.not.exist',
            details: ['workoutId' => $workoutId]
        );
    }

    public static function setNotFound(string $workoutId, string $setId): self
    {
        return new static(
            title: 'That set does not belong to this workout.',
            keyTranslation: 'workout.set.does.not.belong',
            details: ['workoutId' => $workoutId, 'setId' => $setId]
        );
    }

    public static function workoutStillInProgress(string $workoutId): self
    {
        return new static(
            title: 'A workout in progress is driven from the app, not corrected from outside.',
            keyTranslation: 'workout.set.cannot.be.marked.while.in.progress',
            details: ['workoutId' => $workoutId]
        );
    }
}
