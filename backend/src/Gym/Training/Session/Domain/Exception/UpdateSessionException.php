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

    public static function restMustNotBeNegative(): self
    {
        return new static(
            title: 'The rest between sets must not be negative.',
            keyTranslation: 'session.rest.must.not.be.negative',
            details: []
        );
    }

    public static function invalidProgressionMode(string $mode): self
    {
        return new static(
            title: 'The progression mode is not supported.',
            keyTranslation: 'session.progression.mode.invalid',
            details: ['mode' => $mode]
        );
    }

    public static function repToleranceMustNotBeNegative(): self
    {
        return new static(
            title: 'The rep tolerance must not be negative.',
            keyTranslation: 'session.progression.tolerance.must.not.be.negative',
            details: []
        );
    }

    public static function incrementMustBePositive(): self
    {
        return new static(
            title: 'The weight increment must be greater than zero.',
            keyTranslation: 'session.progression.increment.must.be.positive',
            details: []
        );
    }

    public static function repTargetMustBePositive(int $repTarget): self
    {
        return new static(
            title: 'Every rep target must be greater than zero.',
            keyTranslation: 'session.progression.rep.target.must.be.positive',
            details: ['repTarget' => $repTarget]
        );
    }

    public static function progressionNeedsRepTargets(): self
    {
        return new static(
            title: 'A progressing exercise needs a rep target for each effective set.',
            keyTranslation: 'session.progression.needs.rep.targets',
            details: []
        );
    }

    public static function progressionNeedsIncrement(): self
    {
        return new static(
            title: 'A progressing exercise needs a weight increment.',
            keyTranslation: 'session.progression.needs.increment',
            details: []
        );
    }

    public static function invalidSetKind(string $kind): self
    {
        return new static(
            title: 'The kind of the set is not supported.',
            keyTranslation: 'session.set.kind.invalid',
            details: ['kind' => $kind]
        );
    }
}
