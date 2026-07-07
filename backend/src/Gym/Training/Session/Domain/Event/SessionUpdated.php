<?php

namespace Gym\Training\Session\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class SessionUpdated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.gym.event.1.session.updated';
    }
}
