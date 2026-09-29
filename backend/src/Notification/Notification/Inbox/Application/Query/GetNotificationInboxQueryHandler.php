<?php

namespace Notification\Notification\Inbox\Application\Query;

use Notification\Notification\Inbox\Domain\QueryModel\GetNotificationInboxNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetNotificationInboxQueryHandler
{
    public function __construct(
        private GetNotificationInboxNeedleDataQuery $needleDataQuery,
        private GetNotificationInboxDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetNotificationInboxQuery $query): QueryResult
    {
        return $this->dataTransform->transform(inbox: $this->needleDataQuery->findPage(
            userId: $query->userSessionId,
            pageNumber: max(1, $query->pageNumber),
            pageSize: min(max(1, $query->pageSize), 50),
        ));
    }
}
