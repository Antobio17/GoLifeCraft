<?php

namespace Gym\Training\Session\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class SessionExerciseAdded extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $exercises
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $sessionExerciseId,
        public string $exerciseId,
        public string $name,
        public int $estimatedDurationMinutes,
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
        return 'golifecraft.gym.event.1.session.exercise_added';
    }
}
