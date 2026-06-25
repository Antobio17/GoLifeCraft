<?php

namespace Authorization\User\User\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetUserException extends BaseException
{
    public static function accessDenied(): self
    {
        return new static(
            title: 'Access denied, super admin required or self access.',
            keyTranslation: 'access.denied.super_admin_or_self_required',
            details: []
        );
    }

    public static function userNotFound(): self
    {
        return new static(
            title: 'User not found.',
            keyTranslation: 'user.not_found',
            details: []
        );
    }
}
