<?php

namespace Authorization\User\PasswordResetToken\Infrastructure\Domain\QueryModel\InMemory;

use Authorization\User\PasswordResetToken\Domain\QueryModel\Dto\FindUserResult;
use Authorization\User\PasswordResetToken\Domain\QueryModel\RequestPasswordResetNeedleDataQuery;

final class InMemoryRequestPasswordResetNeedleDataQuery implements RequestPasswordResetNeedleDataQuery
{
    /** @var FindUserResult[] */
    private array $usersByUsername = [];

    public function add(FindUserResult $user): void
    {
        $this->usersByUsername[$user->username] = $user;
    }

    public function findUserByUsername(string $username): ?FindUserResult
    {
        return $this->usersByUsername[$username] ?? null;
    }
}
