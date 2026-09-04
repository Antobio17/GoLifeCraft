<?php

namespace Authorization\User\EmailVerificationToken\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class EmailVerificationTokenConsumed extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $userId,
        public string $tokenHash,
        public \DateTime $createdAt,
        public \DateTime $expiresAt,
        public ?\DateTime $consumedAt,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.authorization.event.1.email_verification_token.consumed';
    }
}
