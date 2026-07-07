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

    public static function durationMustNotBeNegative(): self
    {
        return new static(
            title: 'The estimated duration must not be negative.',
            keyTranslation: 'session.duration.must.not.be.negative',
            details: []
        );
    }
}
