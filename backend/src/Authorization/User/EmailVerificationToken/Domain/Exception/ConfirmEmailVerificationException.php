<?php

namespace Authorization\User\EmailVerificationToken\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ConfirmEmailVerificationException extends BaseException
{
    public static function invalid(): self
    {
        return new static(
            title: 'Email verification token is invalid.',
            keyTranslation: 'email_verification.token.invalid',
            details: []
        );
    }

    public static function alreadyUsed(string $tokenId): self
    {
        return new static(
            title: 'Email verification token has already been used.',
            keyTranslation: 'email_verification.token.already_used',
            details: ['tokenId' => $tokenId]
        );
    }

    public static function expired(string $tokenId): self
    {
        return new static(
            title: 'Email verification token has expired.',
            keyTranslation: 'email_verification.token.expired',
            details: ['tokenId' => $tokenId]
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
