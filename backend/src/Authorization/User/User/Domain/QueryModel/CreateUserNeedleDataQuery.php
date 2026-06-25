<?php

namespace Authorization\User\User\Domain\QueryModel;

interface CreateUserNeedleDataQuery
{
    public function userAlreadyExists(string $username): bool;

    public function getTenantIdFromUserCreating(string $userId): ?string;
}
