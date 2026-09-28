<?php

namespace Notification\Notification\PushSubscription\Application\Query\GetPushNotificationsConfig;

use Notification\Notification\PushSubscription\Domain\QueryModel\Dto\GetPushNotificationsConfigResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetPushNotificationsConfigDataTransform
{
    public function transform(GetPushNotificationsConfigResult $config): QueryResult;
}
