<?php

namespace Gym\Training\Session\Infrastructure\Domain\Model\InMemory;

use Gym\Training\Session\Domain\Model\Session;
use Gym\Training\Session\Domain\Model\SessionRepository;

final class InMemorySessionRepository implements SessionRepository
{
    private array $sessions = [];

    public function nextId(): string
    {
        return 'session-'.(count(value: $this->sessions) + 1);
    }

    public function findById(string $id): ?Session
    {
        foreach ($this->sessions as $session) {
            if ($session->id === $id) {
                return $session;
            }
        }

        return null;
    }

    public function save(Session $session): void
    {
        foreach ($this->sessions as $key => $existing) {
            if ($existing->id === $session->id) {
                $this->sessions[$key] = $session;

                return;
            }
        }

        $this->sessions[] = $session;
    }

    public function delete(Session $session): void
    {
        foreach ($this->sessions as $key => $existing) {
            if ($existing->id === $session->id) {
                unset($this->sessions[$key]);
                break;
            }
        }
    }
}
