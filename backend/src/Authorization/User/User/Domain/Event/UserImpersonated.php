<?php

namespace Authorization\User\User\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class UserImpersonated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $username,
        public string $email,
        public string $name,
        public string $lastname,
        public string $role,
        public string $tenantId,
        public bool $isActive,
        public string $impersonatorUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.authorization.event.1.user.impersonated';
    }
}
