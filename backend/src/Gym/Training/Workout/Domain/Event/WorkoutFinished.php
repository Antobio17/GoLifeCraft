<?php

namespace Gym\Training\Workout\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class WorkoutFinished extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public int $durationSeconds,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.gym.event.1.workout.finished';
    }
}
