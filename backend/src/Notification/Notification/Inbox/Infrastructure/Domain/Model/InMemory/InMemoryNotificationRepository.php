<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\Model\InMemory;

use Notification\Notification\Inbox\Domain\Model\Notification;
use Notification\Notification\Inbox\Domain\Model\NotificationRepository;

final class InMemoryNotificationRepository implements NotificationRepository
{
    /** @var array<string, Notification> */
    private array $notifications = [];

    private int $sequence = 0;

    public function nextId(): string
    {
        return 'notification-'.++$this->sequence;
    }

    public function save(Notification $notification): void
    {
        $this->notifications[$notification->id] = $notification;
    }

    /** @return Notification[] */
    public function all(): array
    {
        return array_values(array: $this->notifications);
    }
}
