<?php

namespace Gamification\Achievement\Achievement\Domain\Model;

final readonly class AchievementTierThreshold
{
    public function __construct(
        public AchievementTier $tier,
        public int $threshold,
    ) {
    }
}
