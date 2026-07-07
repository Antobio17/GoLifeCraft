<?php

namespace Gym\Library\Exercise\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ExerciseUpdated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public string $type,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.gym.event.1.exercise.updated';
    }
}
