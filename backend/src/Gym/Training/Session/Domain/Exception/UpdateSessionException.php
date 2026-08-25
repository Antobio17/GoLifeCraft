<?php

namespace Gym\Training\Session\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateSessionException extends BaseException
{
    public static function sessionWithNameAlreadyExists(string $name): self
    {
        return new static(
            title: 'Session with this name already exists.',
            keyTranslation: 'session.with.name.already.exists',
            details: ['name' => $name]
        );
    }

    public static function sessionNotFound(string $sessionId): self
    {
        return new static(
            title: 'Session does not exist.',
            keyTranslation: 'session.does.not.exist',
            details: ['sessionId' => $sessionId]
        );
    }

    public static function sessionExerciseNotFound(string $sessionExerciseId): self
    {
        return new static(
            title: 'Session exercise does not exist.',
            keyTranslation: 'session.exercise.does.not.exist',
            details: ['sessionExerciseId' => $sessionExerciseId]
        );
    }

    public static function sessionExerciseAlreadyExists(string $sessionExerciseId): self
    {
        return new static(
            title: 'Session exercise already exists.',
            keyTranslation: 'session.exercise.already.exists',
            details: ['sessionExerciseId' => $sessionExerciseId]
        );
    }

    public static function sessionExerciseOrderMismatch(string $sessionId): self
    {
        return new static(
            title: 'The given order does not match the exercises of the session.',
            keyTranslation: 'session.exercise.order.mismatch',
            details: ['sessionId' => $sessionId]
        );
    }

    public static function durationMustNotBeNegative(): self
    {
        return new static(
            title: 'The estimated duration must not be negative.',
            keyTranslation: 'session.duration.must.not.be.negative',
            details: []
        );
    }
}
