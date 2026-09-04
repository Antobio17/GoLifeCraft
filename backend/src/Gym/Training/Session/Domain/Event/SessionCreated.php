<?php

namespace Gym\Training\Session\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class SessionCreated extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $exercises
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public int $estimatedDurationMinutes,
        public int $restSeconds,
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
        return 'golifecraft.gym.event.1.session.created';
    }
}
