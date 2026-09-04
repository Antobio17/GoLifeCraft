<?php

namespace Authorization\User\User\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class UserAccessGranted extends DomainEvent
{
    /**
     * @param string[]                   $roles
     * @param array<string, string>|null $visualPreferences
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $username,
        public string $tenantId,
        public string $email,
        public string $name,
        public string $lastname,
        public string $role,
        public array $roles,
        public bool $isActive,
        public bool $emailVerified,
        public string $theme,
        public ?array $visualPreferences,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.authorization.event.1.user.access_granted';
    }
}
