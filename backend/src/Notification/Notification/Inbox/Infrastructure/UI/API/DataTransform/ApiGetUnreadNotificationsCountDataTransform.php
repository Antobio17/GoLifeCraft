<?php

namespace Notification\Notification\Inbox\Infrastructure\UI\API\DataTransform;

use Notification\Notification\Inbox\Application\Query\GetUnreadNotificationsCountDataTransform;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\GetUnreadNotificationsCountResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetUnreadNotificationsCountDataTransform implements GetUnreadNotificationsCountDataTransform
{
    public function transform(GetUnreadNotificationsCountResult $count): QueryResult
    {
        return new QuerySingleResult(item: $count);
    }
}
