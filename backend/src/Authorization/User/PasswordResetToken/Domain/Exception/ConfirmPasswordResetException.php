<?php

namespace Authorization\User\PasswordResetToken\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ConfirmPasswordResetException extends BaseException
{
    public static function invalid(): self
    {
        return new static(
            title: 'Password reset token is invalid.',
            keyTranslation: 'password_reset.token.invalid',
            details: []
        );
    }

    public static function alreadyUsed(string $tokenId): self
    {
        return new static(
            title: 'Password reset token has already been used.',
            keyTranslation: 'password_reset.token.already_used',
            details: ['tokenId' => $tokenId]
        );
    }

    public static function expired(string $tokenId): self
    {
        return new static(
            title: 'Password reset token has expired.',
            keyTranslation: 'password_reset.token.expired',
            details: ['tokenId' => $tokenId]
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

    public static function userNotFound(string $userId): self
    {
        return new static(
            title: 'User not found.',
            keyTranslation: 'user.not.found',
            details: ['userId' => $userId]
        );
    }
}
