<?php

namespace Gamification\Achievement\Achievement\Infrastructure\Domain\Model\InMemory;

use Gamification\Achievement\Achievement\Domain\Model\AchievementProgress;
use Gamification\Achievement\Achievement\Domain\Model\AchievementProgressRepository;

final class InMemoryAchievementProgressRepository implements AchievementProgressRepository
{
    /** @var array<string, AchievementProgress> */
    private array $progress = [];

    private int $generatedIds = 0;

    public function nextId(): string
    {
        return 'achievement-progress-'.(++$this->generatedIds);
    }

    public function findByDefinitionKey(string $definitionKey): ?AchievementProgress
    {
        return $this->progress[$definitionKey] ?? null;
    }

    public function save(AchievementProgress $achievementProgress): void
    {
        $this->progress[$achievementProgress->definitionKey] = $achievementProgress;
    }

    public function delete(AchievementProgress $achievementProgress): void
    {
        unset($this->progress[$achievementProgress->definitionKey]);
    }

    /**
     * @return AchievementProgress[]
     */
    public function all(): array
    {
        return array_values(array: $this->progress);
    }
}
