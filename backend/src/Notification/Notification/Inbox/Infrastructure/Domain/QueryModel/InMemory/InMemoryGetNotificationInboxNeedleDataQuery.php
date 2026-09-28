<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\InMemory;

use Notification\Notification\Inbox\Domain\Model\Notification;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\GetNotificationInboxResult;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\NotificationView;
use Notification\Notification\Inbox\Domain\QueryModel\GetNotificationInboxNeedleDataQuery;
use Notification\Notification\Inbox\Infrastructure\Domain\Model\InMemory\InMemoryNotificationRepository;
use Notification\Notification\Settings\Domain\Model\NotificationType;

final readonly class InMemoryGetNotificationInboxNeedleDataQuery implements GetNotificationInboxNeedleDataQuery
{
    public function __construct(
        private InMemoryNotificationRepository $repository,
    ) {
    }

    public function findPage(string $userId, ?\DateTime $seenAt, int $pageNumber, int $pageSize): GetNotificationInboxResult
    {
        $notifications = $this->ofUser(userId: $userId);
        usort($notifications, static fn (Notification $left, Notification $right): int => $right->deliveredAt <=> $left->deliveredAt);

        return new GetNotificationInboxResult(
            items: array_map(
                callback: static fn (Notification $notification): NotificationView => new NotificationView(
                    id: $notification->id,
                    type: $notification->type,
                    module: NotificationType::from(value: $notification->type)->module(),
                    params: $notification->params,
                    title: $notification->title,
                    body: $notification->body,
                    url: $notification->url,
                    pushed: $notification->pushed,
                    unread: null === $seenAt || $notification->deliveredAt > $seenAt,
                    deliveredAt: $notification->deliveredAt,
                ),
                array: array_slice(array: $notifications, offset: ($pageNumber - 1) * $pageSize, length: $pageSize),
            ),
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: count(value: $notifications),
            unreadCount: $this->countUnread(userId: $userId, seenAt: $seenAt),
        );
    }

    public function countUnread(string $userId, ?\DateTime $seenAt): int
    {
        return count(value: array_filter(
            array: $this->ofUser(userId: $userId),
            callback: static fn (Notification $notification): bool => null === $seenAt || $notification->deliveredAt > $seenAt,
        ));
    }

    /**
     * @return Notification[]
     */
    private function ofUser(string $userId): array
    {
        return array_values(array: array_filter(
            array: $this->repository->all(),
            callback: static fn (Notification $notification): bool => $notification->userId === $userId,
        ));
    }
}
