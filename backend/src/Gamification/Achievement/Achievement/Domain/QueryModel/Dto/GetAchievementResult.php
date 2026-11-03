<?php

namespace Gamification\Achievement\Achievement\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetAchievementResult extends QueryAggregateResult
{
    /**
     * @param AchievementTierView[] $tiers
     * @param string[]              $unseenTiers
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $key,
        public readonly string $module,
        public readonly string $icon,
        public readonly string $metric,
        public readonly int $value,
        public readonly int $progressValue,
        public readonly int $activeStreak,
        public readonly array $tiers,
        public readonly ?string $currentTier,
        public readonly ?string $nextTier,
        public readonly ?int $nextThreshold,
        public readonly ?int $remaining,
        public readonly float $progress,
        public readonly array $unseenTiers,
        public readonly ?string $lastUnlockedAt,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
