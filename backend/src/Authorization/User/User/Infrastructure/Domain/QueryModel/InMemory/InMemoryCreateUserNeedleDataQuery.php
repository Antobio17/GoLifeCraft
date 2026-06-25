<?php

namespace Authorization\User\User\Infrastructure\Domain\QueryModel\InMemory;

use Authorization\User\User\Domain\QueryModel\CreateUserNeedleDataQuery;

final class InMemoryCreateUserNeedleDataQuery implements CreateUserNeedleDataQuery
{
    private array $existingUsernames = [];
    private array $userTenants = [];

    public function addExistingUsername(string $username): void
    {
        $this->existingUsernames[] = $username;
    }

    public function addUserWithTenant(string $userId, string $tenantId): void
    {
        $this->userTenants[$userId] = $tenantId;
    }

    public function userAlreadyExists(string $username): bool
    {
        return in_array(needle: $username, haystack: $this->existingUsernames, strict: true);
    }

    public function getTenantIdFromUserCreating(string $userId): ?string
    {
        return $this->userTenants[$userId] ?? null;
    }
}
