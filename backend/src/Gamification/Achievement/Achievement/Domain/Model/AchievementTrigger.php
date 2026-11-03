<?php

namespace Gamification\Achievement\Achievement\Domain\Model;

final readonly class AchievementTrigger
{
    /**
     * @param array<string, scalar|null> $conditions
     */
    public function __construct(
        public string $eventName,
        public array $conditions,
    ) {
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function matches(string $eventName, array $payload): bool
    {
        if ($eventName !== $this->eventName) {
            return false;
        }

        foreach ($this->conditions as $field => $expected) {
            if (!array_key_exists(key: $field, array: $payload)) {
                return false;
            }

            if ($payload[$field] !== $expected) {
                return false;
            }
        }

        return true;
    }
}
