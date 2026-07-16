<?php

namespace Authorization\User\Registration\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class RegisterUserException extends BaseException
{
    public static function emailAlreadyExists(string $email): self
    {
        return new static(
            title: 'A user with this email already exists.',
            keyTranslation: 'user.already.exists',
            details: ['email' => $email]
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
