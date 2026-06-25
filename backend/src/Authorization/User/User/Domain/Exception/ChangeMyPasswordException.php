<?php

namespace Authorization\User\User\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ChangeMyPasswordException extends BaseException
{
    public static function currentPasswordInvalid(): self
    {
        return new static(
            title: 'Current password is invalid.',
            keyTranslation: 'user.current_password.invalid',
            details: []
        );
    }

    public static function notFound(string $userId): self
    {
        return new static(
            title: 'User not found.',
            keyTranslation: 'user.not.found',
            details: ['userId' => $userId]
        );
    }

    public static function weakPassword(): self
    {
        return new static(
            title: 'Password does not meet security requirements.',
            keyTranslation: 'user.password.weak',
            details: []
        );
    }
}
