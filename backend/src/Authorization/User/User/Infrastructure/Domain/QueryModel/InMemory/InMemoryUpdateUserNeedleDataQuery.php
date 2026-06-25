<?php

namespace Authorization\User\User\Infrastructure\Domain\QueryModel\InMemory;

use Authorization\User\User\Domain\QueryModel\UpdateUserNeedleDataQuery;

final class InMemoryUpdateUserNeedleDataQuery implements UpdateUserNeedleDataQuery
{
    private array $userRoles = [];
    private array $existingUsernames = [];

    public function addUserRole(string $userId, string $role): void
    {
        $this->userRoles[$userId] = $role;
    }

    public function addExistingUsername(string $username, string $userId): void
    {
        $this->existingUsernames[$username] = $userId;
    }

    public function getUserRole(string $userId): ?string
    {
        return $this->userRoles[$userId] ?? null;
    }

    public function usernameAlreadyExists(string $username, string $excludeUserId): bool
    {
        if (!array_key_exists(key: $username, array: $this->existingUsernames)) {
            return false;
        }

        return $this->existingUsernames[$username] !== $excludeUserId;
    }
}
