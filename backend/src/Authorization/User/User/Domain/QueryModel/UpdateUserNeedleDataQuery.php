<?php

namespace Authorization\User\User\Domain\QueryModel;

interface UpdateUserNeedleDataQuery
{
    public function getUserRole(string $userId): ?string;

    public function usernameAlreadyExists(string $username, string $excludeUserId): bool;
}
