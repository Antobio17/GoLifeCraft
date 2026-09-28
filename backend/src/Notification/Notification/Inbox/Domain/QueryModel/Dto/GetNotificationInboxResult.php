<?php

namespace Notification\Notification\Inbox\Domain\QueryModel\Dto;

final readonly class GetNotificationInboxResult
{
    /**
     * @param NotificationView[] $items
     */
    public function __construct(
        public array $items,
        public int $pageNumber,
        public int $pageSize,
        public int $total,
        public int $unreadCount,
    ) {
    }
}
