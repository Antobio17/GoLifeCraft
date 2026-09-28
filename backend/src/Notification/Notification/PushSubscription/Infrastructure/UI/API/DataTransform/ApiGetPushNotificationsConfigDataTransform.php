<?php

namespace Notification\Notification\PushSubscription\Infrastructure\UI\API\DataTransform;

use Notification\Notification\PushSubscription\Application\Query\GetPushNotificationsConfig\GetPushNotificationsConfigDataTransform;
use Notification\Notification\PushSubscription\Domain\QueryModel\Dto\GetPushNotificationsConfigResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetPushNotificationsConfigDataTransform implements GetPushNotificationsConfigDataTransform
{
    public function transform(GetPushNotificationsConfigResult $config): QueryResult
    {
        return new QuerySingleResult(item: $config);
    }
}
