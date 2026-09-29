<?php

namespace Notification\Notification\Inbox\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class NotificationDismissed extends DomainEvent
{
    /**
     * @param array<string, scalar|null> $params
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $userId,
        public string $type,
        public string $dedupeKey,
        public array $params,
        public string $title,
        public string $body,
        public ?string $url,
        public bool $pushed,
        public \DateTime $dueAt,
        public \DateTime $deliveredAt,
        public ?\DateTime $readAt,
        public ?\DateTime $dismissedAt,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.notification.event.1.notification.dismissed';
    }
}
