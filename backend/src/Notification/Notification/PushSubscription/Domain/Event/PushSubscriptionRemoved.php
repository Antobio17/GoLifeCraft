<?php

namespace Notification\Notification\PushSubscription\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class PushSubscriptionRemoved extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $reason,
        public string $userId,
        public string $endpoint,
        public string $endpointHash,
        public string $contentEncoding,
        public ?string $userAgent,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $removedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.notification.event.1.push_subscription.removed';
    }
}
