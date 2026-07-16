<?php

namespace Authorization\User\PasswordResetToken\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class PasswordResetTokenConsumed extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $userId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.authorization.event.1.passwordResetToken.consumed';
    }
}
