<?php

namespace Notification\Notification\Settings\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class NotificationInboxSeen extends DomainEvent
{
    /**
     * @param array<string, array{enabled: bool, time: ?string, leadMinutes: ?int}> $preferences
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $userId,
        public string $timezone,
        public string $languageCode,
        public bool $quietHoursEnabled,
        public string $quietHoursStart,
        public string $quietHoursEnd,
        public array $preferences,
        public ?\DateTime $inboxSeenAt,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.notification.event.1.notification_settings.inbox_seen';
    }
}
