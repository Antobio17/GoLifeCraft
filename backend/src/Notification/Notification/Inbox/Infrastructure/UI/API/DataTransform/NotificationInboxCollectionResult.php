<?php

namespace Notification\Notification\Inbox\Infrastructure\UI\API\DataTransform;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\WithQueryMeta;

final readonly class NotificationInboxCollectionResult extends QueryCollectionResult implements WithQueryMeta
{
    public function __construct(
        array $items,
        int $pageNumber,
        int $pageSize,
        int $total,
        private int $unreadCount,
    ) {
        parent::__construct(items: $items, pageNumber: $pageNumber, pageSize: $pageSize, total: $total);
    }

    public function getQueryMeta(): array
    {
        return ['unreadCount' => $this->unreadCount];
    }
}
