<?php

namespace Notification\Notification\Inbox\Infrastructure\UI\API\DataTransform;

use Notification\Notification\Inbox\Application\Query\GetNotificationInboxDataTransform;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\GetNotificationInboxResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

final class ApiGetNotificationInboxDataTransform implements GetNotificationInboxDataTransform
{
    public function transform(GetNotificationInboxResult $inbox): QueryResult
    {
        return new NotificationInboxCollectionResult(
            items: $inbox->items,
            pageNumber: $inbox->pageNumber,
            pageSize: $inbox->pageSize,
            total: $inbox->total,
            unreadCount: $inbox->unreadCount,
        );
    }
}
