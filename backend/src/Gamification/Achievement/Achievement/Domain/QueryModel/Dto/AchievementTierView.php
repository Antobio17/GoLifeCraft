<?php

namespace Gamification\Achievement\Achievement\Domain\QueryModel\Dto;

final readonly class AchievementTierView
{
    public function __construct(
        public string $tier,
        public int $threshold,
        public bool $unlocked,
        public ?string $unlockedAt,
        public bool $seen,
    ) {
    }
}
