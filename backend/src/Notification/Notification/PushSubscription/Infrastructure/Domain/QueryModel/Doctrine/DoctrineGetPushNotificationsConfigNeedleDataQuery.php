<?php

namespace Notification\Notification\PushSubscription\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Notification\Notification\PushSubscription\Domain\QueryModel\GetPushNotificationsConfigNeedleDataQuery;

final readonly class DoctrineGetPushNotificationsConfigNeedleDataQuery implements GetPushNotificationsConfigNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function countSubscriptionsOf(string $userId): int
    {
        return (int) $this->connection
            ->createQueryBuilder()
            ->select('COUNT(id)')
            ->from(table: 'push_subscription')
            ->where('user_id = :userId')
            ->setParameter(key: 'userId', value: $userId)
            ->executeQuery()
            ->fetchOne();
    }
}
