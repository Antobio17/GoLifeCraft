<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\InMemory;

use Notification\Notification\Inbox\Domain\Model\Notification;
use Notification\Notification\Inbox\Domain\QueryModel\MarkNotificationsReadNeedleDataQuery;
use Notification\Notification\Inbox\Infrastructure\Domain\Model\InMemory\InMemoryNotificationRepository;

final readonly class InMemoryMarkNotificationsReadNeedleDataQuery implements MarkNotificationsReadNeedleDataQuery
{
    public function __construct(
        private InMemoryNotificationRepository $repository,
    ) {
    }

    public function unreadDeliveredUntil(string $userId, \DateTime $until): array
    {
        return array_values(array: array_map(
            callback: static fn (Notification $notification): string => $notification->id,
            array: array_filter(
                array: $this->repository->all(),
                callback: static fn (Notification $notification): bool => $notification->userId === $userId
                    && null === $notification->readAt
                    && null === $notification->dismissedAt
                    && $notification->deliveredAt <= $until,
            ),
        ));
    }
}
