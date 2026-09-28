<?php

namespace Notification\Notification\Inbox\Domain\QueryModel;

use Notification\Notification\Inbox\Domain\QueryModel\Dto\GetNotificationInboxResult;

interface GetNotificationInboxNeedleDataQuery
{
    public function findPage(string $userId, ?\DateTime $seenAt, int $pageNumber, int $pageSize): GetNotificationInboxResult;

    public function countUnread(string $userId, ?\DateTime $seenAt): int;
}
