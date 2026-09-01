<?php

namespace Authorization\User\Usage\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetUserUsageException extends BaseException
{
    public static function accessDenied(): self
    {
        return new static(
            title: 'Only administrators can read the usage of a user.',
            keyTranslation: 'user.usage.access.denied',
            details: []
        );
    }

    public static function userNotFound(string $userId): self
    {
        return new static(
            title: 'User not found.',
            keyTranslation: 'user.usage.user.not.found',
            details: ['userId' => $userId]
        );
    }
}
