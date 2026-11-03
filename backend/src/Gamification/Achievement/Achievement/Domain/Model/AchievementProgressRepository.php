<?php

namespace Gamification\Achievement\Achievement\Domain\Model;

interface AchievementProgressRepository
{
    public function nextId(): string;

    public function findByDefinitionKey(string $definitionKey): ?AchievementProgress;

    public function save(AchievementProgress $achievementProgress): void;

    public function delete(AchievementProgress $achievementProgress): void;
}
