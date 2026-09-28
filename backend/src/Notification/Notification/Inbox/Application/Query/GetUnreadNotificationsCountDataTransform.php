<?php

namespace Notification\Notification\Inbox\Application\Query;

use Notification\Notification\Inbox\Domain\QueryModel\Dto\GetUnreadNotificationsCountResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetUnreadNotificationsCountDataTransform
{
    public function transform(GetUnreadNotificationsCountResult $count): QueryResult;
}
