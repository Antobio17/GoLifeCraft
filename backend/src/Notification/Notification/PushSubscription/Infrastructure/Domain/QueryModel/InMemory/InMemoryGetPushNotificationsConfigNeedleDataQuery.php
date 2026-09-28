<?php

namespace Notification\Notification\PushSubscription\Infrastructure\Domain\QueryModel\InMemory;

use Notification\Notification\PushSubscription\Domain\QueryModel\GetPushNotificationsConfigNeedleDataQuery;
use Notification\Notification\PushSubscription\Infrastructure\Domain\Model\InMemory\InMemoryPushSubscriptionRepository;

final readonly class InMemoryGetPushNotificationsConfigNeedleDataQuery implements GetPushNotificationsConfigNeedleDataQuery
{
    public function __construct(
        private InMemoryPushSubscriptionRepository $repository,
    ) {
    }

    public function countSubscriptionsOf(string $userId): int
    {
        return count(value: $this->repository->findByUserId(userId: $userId));
    }
}
