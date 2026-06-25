<?php

namespace Authorization\User\User\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateUserException extends BaseException
{
    public static function userNotFound(string $userId): self
    {
        return new static(
            title: 'User with this ID does not exist.',
            keyTranslation: 'user.does.not.exist',
            details: ['userId' => $userId]
        );
    }

    public static function usernameAlreadyExists(string $username): self
    {
        return new static(
            title: 'User with this username already exists.',
            keyTranslation: 'user.with.username.already.exists',
            details: ['username' => $username]
        );
    }

    public static function newRoleIsNotAvailable(
        string $role,
        array $availableRoles,
    ): self {
        return new static(
            title: 'New role is not available.',
            keyTranslation: 'new.role.is.not.available',
            details: [
                'role' => $role,
                'availableRoles' => $availableRoles,
            ]
        );
    }

    public static function cannotUpdateUserToGodRole(): self
    {
        return new static(
            title: 'Cannot update a user to GOD role.',
            keyTranslation: 'cannot.update.user.to.god.role'
        );
    }

    public static function accessDeniedToChangeRole(): self
    {
        return new static(
            title: 'Only users with GOD role can change user roles.',
            keyTranslation: 'access.denied.to.change.role',
            details: []
        );
    }

    public static function cannotChangeSelfRole(): self
    {
        return new static(
            title: 'Users cannot change their own role.',
            keyTranslation: 'cannot.change.self.role',
            details: []
        );
    }

    public static function cannotEditGodUser(): self
    {
        return new static(
            title: 'Cannot edit a GOD user.',
            keyTranslation: 'cannot.edit.god.user',
            details: []
        );
    }

    public static function accessDeniedForReadOnlyRole(): self
    {
        return new static(
            title: 'Access denied: read-only users cannot update users.',
            keyTranslation: 'access.denied.read.only.role',
            details: []
        );
    }
}
