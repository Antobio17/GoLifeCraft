<?php

namespace Notification\Notification\PushSubscription\Domain\QueryModel;

interface GetPushNotificationsConfigNeedleDataQuery
{
    public function countSubscriptionsOf(string $userId): int;
}
