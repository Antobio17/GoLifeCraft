<?php

namespace Authorization\User\User\Infrastructure\Domain\Model\InMemory;

use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;

final class InMemoryUserRepository implements UserRepository
{
    private array $users = [];

    public function nextId(): string
    {
        return (string) (count(value: $this->users) + 1);
    }

    public function findByUsername(string $username): ?User
    {
        foreach ($this->users as $user) {
            if ($user->username === $username) {
                return $user;
            }
        }

        return null;
    }

    public function findById(string $id): ?User
    {
        foreach ($this->users as $user) {
            if ($user->id === $id) {
                return $user;
            }
        }

        return null;
    }

    public function save(User $user): void
    {
        $this->users[] = $user;
    }

    public function delete(User $user): void
    {
        foreach ($this->users as $key => $existingUser) {
            if ($existingUser->id === $user->id) {
                unset($this->users[$key]);
                break;
            }
        }
    }
}
