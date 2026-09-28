<?php

namespace Authorization\User\PushSubscription\Application\Query\GetPushNotificationsConfig;

use Authorization\User\PushSubscription\Domain\QueryModel\Dto\GetPushNotificationsConfigResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetPushNotificationsConfigDataTransform
{
    public function transform(GetPushNotificationsConfigResult $config): QueryResult;
}
