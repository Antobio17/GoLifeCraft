<?php

namespace Authorization\User\User\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CreateUserException extends BaseException
{
    public static function userAlreadyExists(string $username): self
    {
        return new static(
            title: 'User with this username already exists.',
            keyTranslation: 'user.with.username.already.exists',
            details: ['username' => $username]
        );
    }

    public static function createdByUserNotFound(string $userId): self
    {
        return new static(
            title: 'Creating user with this ID does not exist.',
            keyTranslation: 'creating.user.does.not.exist',
            details: ['userId' => $userId]
        );
    }

    public static function cannotCreateUserWithGodRole(): self
    {
        return new static(
            title: 'Cannot create a user with GOD role.',
            keyTranslation: 'cannot.create.user.with.god.role'
        );
    }

    public static function roleIsNotAvailable(string $role, array $availableRoles): self
    {
        return new static(
            title: 'The role does not exist.',
            keyTranslation: 'role.does.not.exist',
            details: [
                'role' => $role,
                'availableRoles' => $availableRoles,
            ]
        );
    }

    public static function accessDeniedForReadOnlyRole(): self
    {
        return new static(
            title: 'Access denied: read-only users cannot create users.',
            keyTranslation: 'access.denied.read.only.role',
            details: []
        );
    }
}
