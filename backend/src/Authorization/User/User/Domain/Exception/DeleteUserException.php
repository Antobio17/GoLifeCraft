<?php

namespace Authorization\User\User\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteUserException extends BaseException
{
    public static function userNotFound(string $userId): self
    {
        return new static(
            title: 'User with this ID does not exist.',
            keyTranslation: 'user.does.not.exist',
            details: ['userId' => $userId]
        );
    }

    public static function cannotDeleteGodUser(): self
    {
        return new static(
            title: 'Cannot delete a user with ROLE_GOD.',
            keyTranslation: 'user.cannot.delete.god',
            details: []
        );
    }

    public static function accessDeniedForReadOnlyRole(): self
    {
        return new static(
            title: 'Access denied: read-only users cannot delete users.',
            keyTranslation: 'access.denied.read.only.role',
            details: []
        );
    }
}
