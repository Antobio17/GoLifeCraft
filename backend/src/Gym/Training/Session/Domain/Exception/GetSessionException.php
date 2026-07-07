<?php

namespace Gym\Training\Session\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetSessionException extends BaseException
{
    public static function notFound(string $sessionId): self
    {
        return new static(
            title: 'Session does not exist.',
            keyTranslation: 'session.does.not.exist',
            details: ['sessionId' => $sessionId]
        );
    }
}
