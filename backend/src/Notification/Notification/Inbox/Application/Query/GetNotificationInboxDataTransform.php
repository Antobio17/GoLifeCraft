<?php

namespace Notification\Notification\Inbox\Application\Query;

use Notification\Notification\Inbox\Domain\QueryModel\Dto\GetNotificationInboxResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetNotificationInboxDataTransform
{
    public function transform(GetNotificationInboxResult $inbox): QueryResult;
}
