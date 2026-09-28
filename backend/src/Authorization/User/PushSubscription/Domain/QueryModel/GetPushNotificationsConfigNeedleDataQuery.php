<?php

namespace Authorization\User\PushSubscription\Domain\QueryModel;

interface GetPushNotificationsConfigNeedleDataQuery
{
    public function countSubscriptionsOf(string $userId): int;
}
