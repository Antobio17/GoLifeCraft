<?php

namespace Notification\Notification\Inbox\Application\Query;

use Notification\Notification\Inbox\Domain\QueryModel\Dto\GetUnreadNotificationsCountResult;
use Notification\Notification\Inbox\Domain\QueryModel\GetNotificationInboxNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetUnreadNotificationsCountQueryHandler
{
    public function __construct(
        private GetNotificationInboxNeedleDataQuery $needleDataQuery,
        private GetUnreadNotificationsCountDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetUnreadNotificationsCountQuery $query): QueryResult
    {
        return $this->dataTransform->transform(count: new GetUnreadNotificationsCountResult(
            id: $query->userSessionId,
            count: $this->needleDataQuery->countUnread(userId: $query->userSessionId),
        ));
    }
}
