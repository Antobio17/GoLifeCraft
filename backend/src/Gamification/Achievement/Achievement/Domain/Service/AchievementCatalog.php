<?php

namespace Gamification\Achievement\Achievement\Domain\Service;

use Gamification\Achievement\Achievement\Domain\Model\AchievementDefinition;

interface AchievementCatalog
{
    /**
     * @return AchievementDefinition[]
     */
    public function all(): array;

    public function find(string $key): ?AchievementDefinition;

    /**
     * @param array<string, mixed> $payload
     *
     * @return AchievementDefinition[]
     */
    public function triggeredBy(string $eventName, array $payload): array;

    /**
     * @return string[]
     */
    public function eventNames(): array;
}
