<?php

namespace Authorization\User\Registration\Infrastructure\Domain\QueryModel\InMemory;

use Authorization\User\Registration\Domain\QueryModel\RegisterUserNeedleDataQuery;

final class InMemoryRegisterUserNeedleDataQuery implements RegisterUserNeedleDataQuery
{
    /** @var string[] */
    private array $usernames = [];

    public function add(string $username): void
    {
        $this->usernames[] = $username;
    }

    public function userAlreadyExists(string $username): bool
    {
        return in_array(needle: $username, haystack: $this->usernames, strict: true);
    }
}
