<?php

namespace Authorization\User\User\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class UserDeleted extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $deletedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.authorization.event.1.user.deleted';
    }
}
