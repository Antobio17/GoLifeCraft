<?php

namespace Gamification\Achievement\Achievement\Domain\QueryModel\Dto;

final readonly class AchievementProgressSnapshot
{
    /**
     * @param array<int, array{tier: string, threshold: int, unlockedAt: string, seenAt: string|null}> $unlocks
     */
    public function __construct(
        public string $definitionKey,
        public int $value,
        public int $currentStreak,
        public ?string $lastCompletedPeriodKey,
        public array $unlocks,
    ) {
    }
}
