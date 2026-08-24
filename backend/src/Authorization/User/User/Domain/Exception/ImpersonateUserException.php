<?php

namespace Authorization\User\User\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ImpersonateUserException extends BaseException
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

    public static function cannotImpersonateYourself(): self
    {
        return new static(
            title: 'You cannot impersonate yourself.',
            keyTranslation: 'user.cannot_impersonate_yourself',
            details: []
        );
    }

    public static function userIsNotActive(string $userId): self
    {
        return new static(
            title: 'User has no access granted.',
            keyTranslation: 'user.impersonation.not_active',
            details: ['userId' => $userId]
        );
    }
}
