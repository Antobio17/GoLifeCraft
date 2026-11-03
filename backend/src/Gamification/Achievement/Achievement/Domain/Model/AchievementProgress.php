<?php

namespace Gamification\Achievement\Achievement\Domain\Model;

use Gamification\Achievement\Achievement\Domain\Event\AchievementProgressDeleted;
use Gamification\Achievement\Achievement\Domain\Event\AchievementProgressRecorded;
use Gamification\Achievement\Achievement\Domain\Event\AchievementProgressStarted;
use Gamification\Achievement\Achievement\Domain\Event\AchievementTierUnlocked;
use Gamification\Achievement\Achievement\Domain\Event\AchievementUnlocksSeen;
use Gamification\Achievement\Achievement\Domain\Exception\RecordAchievementProgressException;
use Shared\Shared\Shared\Domain\Model\Aggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class AchievementProgress extends Aggregate
{
    private int $version;

    /**
     * @param array<int, array{tier: string, threshold: int, unlockedAt: string, seenAt: string|null}> $unlocks
     */
    public function __construct(
        public readonly string $id,
        public readonly string $definitionKey,
        public int $value,
        public int $currentStreak,
        public ?string $currentPeriodKey,
        public int $currentPeriodCount,
        public ?string $lastCompletedPeriodKey,
        public array $unlocks,
        public ?\DateTime $lastOccurrenceAt,
        public readonly \DateTime $createdAt,
        public \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public string $updatedByUserId,
    ) {
    }

    public static function start(
        string $id,
        string $definitionKey,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();
        $progress = new self(
            id: $id,
            definitionKey: $definitionKey,
            value: 0,
            currentStreak: 0,
            currentPeriodKey: null,
            currentPeriodCount: 0,
            lastCompletedPeriodKey: null,
            unlocks: [],
            lastOccurrenceAt: null,
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
        );

        $progress->record(event: new AchievementProgressStarted(
            aggregateId: $id,
            occurredOn: $now,
            definitionKey: $progress->definitionKey,
            value: $progress->value,
            currentStreak: $progress->currentStreak,
            currentPeriodKey: $progress->currentPeriodKey,
            currentPeriodCount: $progress->currentPeriodCount,
            lastCompletedPeriodKey: $progress->lastCompletedPeriodKey,
            unlocks: $progress->unlocks,
            lastOccurrenceAt: $progress->lastOccurrenceAt,
            createdAt: $progress->createdAt,
            updatedAt: $progress->updatedAt,
            createdByUserId: $progress->createdByUserId,
            updatedByUserId: $progress->updatedByUserId,
        ));

        return $progress;
    }

    public function registerOccurrence(
        AchievementDefinition $definition,
        \DateTime $occurredAt,
        bool $celebrate,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if ($definition->key !== $this->definitionKey) {
            throw RecordAchievementProgressException::definitionMismatch(
                definitionKey: $definition->key,
                progressDefinitionKey: $this->definitionKey,
            );
        }

        $now = $dateTimeGenerator->now();

        $this->advance(definition: $definition, occurredAt: $occurredAt);
        $reachedTiers = $this->unlockReachedTiers(
            definition: $definition,
            occurredAt: $occurredAt,
            celebrate: $celebrate,
        );

        $this->lastOccurrenceAt = $occurredAt;
        $this->updatedAt = $now;
        $this->updatedByUserId = $updatedByUserId;

        $this->record(event: new AchievementProgressRecorded(
            aggregateId: $this->id,
            occurredOn: $now,
            definitionKey: $this->definitionKey,
            value: $this->value,
            currentStreak: $this->currentStreak,
            currentPeriodKey: $this->currentPeriodKey,
            currentPeriodCount: $this->currentPeriodCount,
            lastCompletedPeriodKey: $this->lastCompletedPeriodKey,
            unlocks: $this->unlocks,
            lastOccurrenceAt: $this->lastOccurrenceAt,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));

        foreach ($reachedTiers as $reachedTier) {
            $this->record(event: new AchievementTierUnlocked(
                aggregateId: $this->id,
                occurredOn: $now,
                definitionKey: $this->definitionKey,
                tier: $reachedTier->tier->value,
                threshold: $reachedTier->threshold,
                value: $this->value,
                currentStreak: $this->currentStreak,
                currentPeriodKey: $this->currentPeriodKey,
                currentPeriodCount: $this->currentPeriodCount,
                lastCompletedPeriodKey: $this->lastCompletedPeriodKey,
                unlocks: $this->unlocks,
                lastOccurrenceAt: $this->lastOccurrenceAt,
                createdAt: $this->createdAt,
                updatedAt: $this->updatedAt,
                createdByUserId: $this->createdByUserId,
                updatedByUserId: $this->updatedByUserId,
            ));
        }
    }

    public function markSeen(string $seenByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        if (!$this->hasUnseenUnlocks()) {
            return;
        }

        $now = $dateTimeGenerator->now();
        $seenAt = $now->format(format: \DateTimeInterface::ATOM);

        $this->unlocks = array_map(
            callback: static fn (array $unlock): array => [...$unlock, 'seenAt' => $unlock['seenAt'] ?? $seenAt],
            array: $this->unlocks,
        );
        $this->updatedAt = $now;
        $this->updatedByUserId = $seenByUserId;

        $this->record(event: new AchievementUnlocksSeen(
            aggregateId: $this->id,
            occurredOn: $now,
            definitionKey: $this->definitionKey,
            value: $this->value,
            currentStreak: $this->currentStreak,
            currentPeriodKey: $this->currentPeriodKey,
            currentPeriodCount: $this->currentPeriodCount,
            lastCompletedPeriodKey: $this->lastCompletedPeriodKey,
            unlocks: $this->unlocks,
            lastOccurrenceAt: $this->lastOccurrenceAt,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function delete(string $deletedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        $now = $dateTimeGenerator->now();
        $this->updatedAt = $now;
        $this->updatedByUserId = $deletedByUserId;

        $this->record(event: new AchievementProgressDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            definitionKey: $this->definitionKey,
            value: $this->value,
            currentStreak: $this->currentStreak,
            currentPeriodKey: $this->currentPeriodKey,
            currentPeriodCount: $this->currentPeriodCount,
            lastCompletedPeriodKey: $this->lastCompletedPeriodKey,
            unlocks: $this->unlocks,
            lastOccurrenceAt: $this->lastOccurrenceAt,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function hasUnseenUnlocks(): bool
    {
        foreach ($this->unlocks as $unlock) {
            if (null === $unlock['seenAt']) {
                return true;
            }
        }

        return false;
    }

    public function hasUnlocked(AchievementTier $tier): bool
    {
        foreach ($this->unlocks as $unlock) {
            if ($tier->value === $unlock['tier']) {
                return true;
            }
        }

        return false;
    }

    private function advance(AchievementDefinition $definition, \DateTime $occurredAt): void
    {
        if (!$definition->metric->isStreak()) {
            ++$this->value;

            return;
        }

        $periodKey = $definition->metric->periodKey(at: $occurredAt);

        if (null !== $this->currentPeriodKey && $periodKey < $this->currentPeriodKey) {
            return;
        }

        if ($periodKey !== $this->currentPeriodKey) {
            $this->currentPeriodKey = $periodKey;
            $this->currentPeriodCount = 0;
        }

        ++$this->currentPeriodCount;

        if ($this->currentPeriodCount !== $definition->minPerPeriod) {
            return;
        }

        $continuesStreak = $this->lastCompletedPeriodKey === $definition->metric->previousPeriodKey(periodKey: $periodKey);

        $this->currentStreak = $continuesStreak ? $this->currentStreak + 1 : 1;
        $this->lastCompletedPeriodKey = $periodKey;
        $this->value = max($this->value, $this->currentStreak);
    }

    /**
     * @return AchievementTierThreshold[]
     */
    private function unlockReachedTiers(AchievementDefinition $definition, \DateTime $occurredAt, bool $celebrate): array
    {
        $unlockedAt = $occurredAt->format(format: \DateTimeInterface::ATOM);
        $reached = [];

        foreach ($definition->tiers() as $tierThreshold) {
            if ($this->value < $tierThreshold->threshold) {
                continue;
            }

            if ($this->hasUnlocked(tier: $tierThreshold->tier)) {
                continue;
            }

            $this->unlocks[] = [
                'tier' => $tierThreshold->tier->value,
                'threshold' => $tierThreshold->threshold,
                'unlockedAt' => $unlockedAt,
                'seenAt' => $celebrate ? null : $unlockedAt,
            ];
            $reached[] = $tierThreshold;
        }

        return $reached;
    }
}
