<?php

namespace Shared\Email\Email\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class SendEmailException extends BaseException
{
    public static function transportFailed(string $email, string $reason): self
    {
        return new static(
            title: 'Email could not be sent.',
            keyTranslation: 'email.transport.failed',
            details: ['email' => $email, 'reason' => $reason],
        );
    }
}
