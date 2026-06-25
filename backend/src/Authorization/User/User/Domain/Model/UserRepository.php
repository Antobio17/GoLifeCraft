<?php

namespace Authorization\User\User\Domain\Model;

interface UserRepository
{
    public function nextId(): string;

    public function findByUsername(string $username): ?User;

    public function findById(string $id): ?User;

    public function save(User $user): void;

    public function delete(User $user): void;
}
