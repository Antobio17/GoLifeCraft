<?php

namespace Gym\Training\Session\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteSessionException extends BaseException
{
    public static function sessionNotFound(string $sessionId): self
    {
        return new static(
            title: 'Session does not exist.',
            keyTranslation: 'session.does.not.exist',
            details: ['sessionId' => $sessionId]
        );
    }
}
