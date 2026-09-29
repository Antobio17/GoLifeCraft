<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Notification\Notification\Inbox\Domain\QueryModel\MarkNotificationsReadNeedleDataQuery;

final readonly class DoctrineMarkNotificationsReadNeedleDataQuery implements MarkNotificationsReadNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function unreadDeliveredUntil(string $userId, \DateTime $until): array
    {
        return $this->connection->createQueryBuilder()
            ->select('n.id')
            ->from(table: 'notification', alias: 'n')
            ->where('n.user_id = :userId')
            ->andWhere('n.read_at IS NULL')
            ->andWhere('n.dismissed_at IS NULL')
            ->andWhere('n.delivered_at <= :until')
            ->setParameter(key: 'userId', value: $userId)
            ->setParameter(key: 'until', value: $until->format(format: 'Y-m-d H:i:s'))
            ->executeQuery()
            ->fetchFirstColumn();
    }
}
