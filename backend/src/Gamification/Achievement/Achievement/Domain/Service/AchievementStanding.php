<?php

namespace Gamification\Achievement\Achievement\Domain\Service;

use Gamification\Achievement\Achievement\Domain\Model\AchievementDefinition;
use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\AchievementProgressSnapshot;
use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\AchievementTierView;
use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\GetAchievementResult;

final class AchievementStanding
{
    public const string AGGREGATE_NAME = 'Achievement';

    public function of(
        AchievementDefinition $definition,
        ?AchievementProgressSnapshot $snapshot,
        \DateTimeInterface $today,
    ): GetAchievementResult {
        $value = $snapshot?->value ?? 0;
        $unlocks = $this->unlocksByTier(snapshot: $snapshot);
        $tiers = $this->tierViews(definition: $definition, unlocks: $unlocks);
        $activeStreak = $this->activeStreak(definition: $definition, snapshot: $snapshot, today: $today);
        $progressValue = $definition->metric->isStreak() ? $activeStreak : $value;
        $nextTier = $this->firstLocked(tiers: $tiers);
        $currentTier = $this->lastUnlocked(tiers: $tiers);

        return new GetAchievementResult(
            id: $definition->key,
            aggregateName: self::AGGREGATE_NAME,
            key: $definition->key,
            module: $definition->module,
            icon: $definition->icon,
            metric: $definition->metric->value,
            value: $value,
            progressValue: $progressValue,
            activeStreak: $activeStreak,
            tiers: $tiers,
            currentTier: $currentTier?->tier,
            nextTier: $nextTier?->tier,
            nextThreshold: $nextTier?->threshold,
            remaining: null === $nextTier ? null : max(0, $nextTier->threshold - $progressValue),
            progress: $this->progress(progressValue: $progressValue, nextTier: $nextTier),
            unseenTiers: array_values(array: array_map(
                callback: static fn (AchievementTierView $tier): string => $tier->tier,
                array: array_filter(
                    array: $tiers,
                    callback: static fn (AchievementTierView $tier): bool => $tier->unlocked && !$tier->seen,
                ),
            )),
            lastUnlockedAt: $currentTier?->unlockedAt,
        );
    }

    /**
     * @return array<string, array{tier: string, threshold: int, unlockedAt: string, seenAt: string|null}>
     */
    private function unlocksByTier(?AchievementProgressSnapshot $snapshot): array
    {
        $unlocks = [];

        foreach ($snapshot?->unlocks ?? [] as $unlock) {
            $unlocks[$unlock['tier']] = $unlock;
        }

        return $unlocks;
    }

    /**
     * @param array<string, array{tier: string, threshold: int, unlockedAt: string, seenAt: string|null}> $unlocks
     *
     * @return AchievementTierView[]
     */
    private function tierViews(AchievementDefinition $definition, array $unlocks): array
    {
        $views = [];

        foreach ($definition->tiers() as $tierThreshold) {
            $unlock = $unlocks[$tierThreshold->tier->value] ?? null;

            $views[] = new AchievementTierView(
                tier: $tierThreshold->tier->value,
                threshold: $tierThreshold->threshold,
                unlocked: null !== $unlock,
                unlockedAt: $unlock['unlockedAt'] ?? null,
                seen: null !== ($unlock['seenAt'] ?? null),
            );
        }

        return $views;
    }

    private function activeStreak(
        AchievementDefinition $definition,
        ?AchievementProgressSnapshot $snapshot,
        \DateTimeInterface $today,
    ): int {
        if (!$definition->metric->isStreak()) {
            return 0;
        }

        if (null === $snapshot?->lastCompletedPeriodKey) {
            return 0;
        }

        $currentPeriodKey = $definition->metric->periodKey(at: $today);
        $alive = [$currentPeriodKey, $definition->metric->previousPeriodKey(periodKey: $currentPeriodKey)];

        if (!in_array(needle: $snapshot->lastCompletedPeriodKey, haystack: $alive, strict: true)) {
            return 0;
        }

        return $snapshot->currentStreak;
    }

    /**
     * @param AchievementTierView[] $tiers
     */
    private function firstLocked(array $tiers): ?AchievementTierView
    {
        foreach ($tiers as $tier) {
            if (!$tier->unlocked) {
                return $tier;
            }
        }

        return null;
    }

    /**
     * @param AchievementTierView[] $tiers
     */
    private function lastUnlocked(array $tiers): ?AchievementTierView
    {
        $last = null;

        foreach ($tiers as $tier) {
            if ($tier->unlocked) {
                $last = $tier;
            }
        }

        return $last;
    }

    private function progress(int $progressValue, ?AchievementTierView $nextTier): float
    {
        if (null === $nextTier) {
            return 1.0;
        }

        return round(num: min(1.0, $progressValue / $nextTier->threshold), precision: 4);
    }
}
