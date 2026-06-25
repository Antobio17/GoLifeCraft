<?php

namespace Authorization\User\User\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class UserCreated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $tenantId,
        public string $username,
        public string $email,
        public string $name,
        public string $lastname,
        public string $role,
        public bool $isActive,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
        public bool $canCreateFolder = false,
        public bool $canDeleteFolder = false,
        public bool $canUploadFile = false,
        public bool $canDeleteFile = false,
        public bool $canSignFile = false,
        public bool $canRollbackSign = false,
        public bool $canAccessUsers = false,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.authorization.event.1.user.created';
    }
}
