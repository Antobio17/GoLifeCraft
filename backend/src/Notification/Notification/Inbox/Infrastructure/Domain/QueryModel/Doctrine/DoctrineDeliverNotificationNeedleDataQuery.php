<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Notification\Notification\Inbox\Domain\QueryModel\DeliverNotificationNeedleDataQuery;

final readonly class DoctrineDeliverNotificationNeedleDataQuery implements DeliverNotificationNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function isDelivered(string $dedupeKey): bool
    {
        return false !== $this->connection->createQueryBuilder()
            ->select('n.id')
            ->from(table: 'notification', alias: 'n')
            ->where('n.dedupe_key = :dedupeKey')
            ->setParameter(key: 'dedupeKey', value: $dedupeKey)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();
    }
}
