<?php

namespace Gamification\Achievement\Achievement\Domain\Model;

final readonly class AchievementDefinition
{
    /**
     * @param int[]                $thresholds
     * @param AchievementTrigger[] $triggers
     */
    public function __construct(
        public string $key,
        public string $module,
        public string $icon,
        public AchievementMetric $metric,
        public int $minPerPeriod,
        public array $thresholds,
        public array $triggers,
    ) {
        if ('' === trim(string: $key)) {
            throw new \InvalidArgumentException(message: 'An achievement needs a key.');
        }

        if ($minPerPeriod < 1) {
            throw new \InvalidArgumentException(message: sprintf('Achievement "%s" needs at least one occurrence per period.', $key));
        }

        if ([] === $thresholds || count(value: $thresholds) > AchievementTier::levels()) {
            throw new \InvalidArgumentException(message: sprintf('Achievement "%s" needs between 1 and %d thresholds.', $key, AchievementTier::levels()));
        }

        if ([] === $triggers) {
            throw new \InvalidArgumentException(message: sprintf('Achievement "%s" needs at least one trigger.', $key));
        }

        $previous = 0;

        foreach ($thresholds as $threshold) {
            if ($threshold <= $previous) {
                throw new \InvalidArgumentException(message: sprintf('Achievement "%s" needs strictly increasing positive thresholds.', $key));
            }

            $previous = $threshold;
        }
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function isTriggeredBy(string $eventName, array $payload): bool
    {
        foreach ($this->triggers as $trigger) {
            if ($trigger->matches(eventName: $eventName, payload: $payload)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return AchievementTierThreshold[]
     */
    public function tiers(): array
    {
        $tiers = [];

        foreach (array_values(array: $this->thresholds) as $level => $threshold) {
            $tiers[] = new AchievementTierThreshold(
                tier: AchievementTier::atLevel(level: $level),
                threshold: $threshold,
            );
        }

        return $tiers;
    }

    /**
     * @return string[]
     */
    public function eventNames(): array
    {
        return array_values(array: array_unique(array: array_map(
            callback: static fn (AchievementTrigger $trigger): string => $trigger->eventName,
            array: $this->triggers,
        )));
    }
}
