<?php

namespace Authorization\User\PasswordResetToken\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class PasswordResetTokenCreated extends DomainEvent
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
        return 'golifecraft.authorization.event.1.password_reset_token.created';
    }
}
