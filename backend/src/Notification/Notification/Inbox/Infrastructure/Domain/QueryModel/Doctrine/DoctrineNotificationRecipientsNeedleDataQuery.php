<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Notification\Notification\Inbox\Domain\Model\NotificationRecipient;
use Notification\Notification\Inbox\Domain\QueryModel\NotificationRecipientsNeedleDataQuery;

final readonly class DoctrineNotificationRecipientsNeedleDataQuery implements NotificationRecipientsNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function activeRecipients(?string $tenantId): array
    {
        $queryBuilder = $this->connection->createQueryBuilder()
            ->select('u.id', 'u.tenant_id')
            ->from(table: '`user`', alias: 'u')
            ->where('u.is_active = 1')
            ->orderBy('u.tenant_id', 'ASC');

        if (null !== $tenantId) {
            $queryBuilder
                ->andWhere('u.tenant_id = :tenantId')
                ->setParameter(key: 'tenantId', value: $tenantId);
        }

        return array_map(
            callback: static fn (array $row): NotificationRecipient => new NotificationRecipient(
                userId: $row['id'],
                tenantId: $row['tenant_id'],
            ),
            array: $queryBuilder->executeQuery()->fetchAllAssociative(),
        );
    }
}
