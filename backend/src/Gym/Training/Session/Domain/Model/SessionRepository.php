<?php

namespace Gym\Training\Session\Domain\Model;

interface SessionRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Session;

    public function save(Session $session): void;

    public function delete(Session $session): void;
}
