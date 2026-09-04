<?php

namespace Gym\Training\Workout\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class WorkoutProgressSaved extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $exercises
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public ?string $sessionId,
        public string $sessionName,
        public string $status,
        public \DateTime $startedAt,
        public ?\DateTime $finishedAt,
        public int $durationSeconds,
        public ?\DateTime $restStartedAt,
        public array $exercises,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.gym.event.1.workout.progress_saved';
    }
}
