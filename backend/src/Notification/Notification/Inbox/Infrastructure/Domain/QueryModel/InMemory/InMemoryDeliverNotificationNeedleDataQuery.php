<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\InMemory;

use Notification\Notification\Inbox\Domain\Model\Notification;
use Notification\Notification\Inbox\Domain\QueryModel\DeliverNotificationNeedleDataQuery;
use Notification\Notification\Inbox\Infrastructure\Domain\Model\InMemory\InMemoryNotificationRepository;

final readonly class InMemoryDeliverNotificationNeedleDataQuery implements DeliverNotificationNeedleDataQuery
{
    public function __construct(
        private InMemoryNotificationRepository $repository,
    ) {
    }

    public function isDelivered(string $dedupeKey): bool
    {
        return [] !== array_filter(
            array: $this->repository->all(),
            callback: static fn (Notification $notification): bool => $notification->dedupeKey === $dedupeKey,
        );
    }
}
