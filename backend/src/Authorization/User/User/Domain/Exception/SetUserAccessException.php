<?php

namespace Authorization\User\User\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class SetUserAccessException extends BaseException
{
    public static function accessDenied(): self
    {
        return new static(
            title: 'Access denied, super admin required.',
            keyTranslation: 'access.denied.super_admin_required',
            details: []
        );
    }

    public static function userNotFound(string $userId): self
    {
        return new static(
            title: 'User not found.',
            keyTranslation: 'user.not_found',
            details: ['userId' => $userId]
        );
    }

    public static function cannotChangeOwnAccess(): self
    {
        return new static(
            title: 'You cannot change your own access.',
            keyTranslation: 'user.cannot_change_own_access',
            details: []
        );
    }
}
