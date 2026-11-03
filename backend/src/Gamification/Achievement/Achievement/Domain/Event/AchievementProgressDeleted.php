<?php

namespace Gamification\Achievement\Achievement\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class AchievementProgressDeleted extends DomainEvent
{
    /**
     * @param array<int, array{tier: string, threshold: int, unlockedAt: string, seenAt: string|null}> $unlocks
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $definitionKey,
        public int $value,
        public int $currentStreak,
        public ?string $currentPeriodKey,
        public int $currentPeriodCount,
        public ?string $lastCompletedPeriodKey,
        public array $unlocks,
        public ?\DateTime $lastOccurrenceAt,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.gamification.event.1.achievement_progress.deleted';
    }
}
