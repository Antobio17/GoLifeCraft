<?php

namespace Gym\Training\Workout\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class EditWorkoutException extends BaseException
{
    public static function workoutNotFound(string $workoutId): self
    {
        return new static(
            title: 'Workout does not exist.',
            keyTranslation: 'workout.does.not.exist',
            details: ['workoutId' => $workoutId]
        );
    }

    public static function workoutNotFinished(string $workoutId): self
    {
        return new static(
            title: 'Only a finished workout can be edited.',
            keyTranslation: 'workout.edit.not.finished',
            details: ['workoutId' => $workoutId]
        );
    }

    public static function emptySessionName(string $workoutId): self
    {
        return new static(
            title: 'The workout needs a name.',
            keyTranslation: 'workout.edit.name.empty',
            details: ['workoutId' => $workoutId]
        );
    }

    public static function startedInTheFuture(string $workoutId, string $startedAt): self
    {
        return new static(
            title: 'A workout of the history cannot start in the future.',
            keyTranslation: 'workout.edit.started.future',
            details: ['workoutId' => $workoutId, 'startedAt' => $startedAt]
        );
    }

    public static function invalidDuration(string $workoutId, int $durationSeconds): self
    {
        return new static(
            title: 'The duration of the workout is out of range.',
            keyTranslation: 'workout.edit.duration.invalid',
            details: ['workoutId' => $workoutId, 'durationSeconds' => $durationSeconds]
        );
    }
}
