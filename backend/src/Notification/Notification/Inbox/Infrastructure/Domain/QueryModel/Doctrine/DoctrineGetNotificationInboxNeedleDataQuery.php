<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\GetNotificationInboxResult;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\NotificationView;
use Notification\Notification\Inbox\Domain\QueryModel\GetNotificationInboxNeedleDataQuery;
use Notification\Notification\Settings\Domain\Model\NotificationType;

final readonly class DoctrineGetNotificationInboxNeedleDataQuery implements GetNotificationInboxNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findPage(string $userId, int $pageNumber, int $pageSize): GetNotificationInboxResult
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('n.id', 'n.type', 'n.params', 'n.title', 'n.body', 'n.url', 'n.pushed', 'n.read_at', 'n.delivered_at')
            ->from(table: 'notification', alias: 'n')
            ->where('n.user_id = :userId')
            ->andWhere('n.dismissed_at IS NULL')
            ->setParameter(key: 'userId', value: $userId)
            ->orderBy('n.delivered_at', 'DESC')
            ->addOrderBy('n.id', 'DESC')
            ->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        $total = (int) $this->connection->createQueryBuilder()
            ->select('COUNT(n.id)')
            ->from(table: 'notification', alias: 'n')
            ->where('n.user_id = :userId')
            ->andWhere('n.dismissed_at IS NULL')
            ->setParameter(key: 'userId', value: $userId)
            ->executeQuery()
            ->fetchOne();

        return new GetNotificationInboxResult(
            items: array_map(
                callback: fn (array $row): NotificationView => $this->toView(row: $row),
                array: $rows,
            ),
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
            unreadCount: $this->countUnread(userId: $userId),
        );
    }

    public function countUnread(string $userId): int
    {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(n.id)')
            ->from(table: 'notification', alias: 'n')
            ->where('n.user_id = :userId')
            ->andWhere('n.dismissed_at IS NULL')
            ->andWhere('n.read_at IS NULL')
            ->setParameter(key: 'userId', value: $userId)
            ->executeQuery()
            ->fetchOne();
    }

    /**
     * @param array<string, mixed> $row
     */
    private function toView(array $row): NotificationView
    {
        $deliveredAt = new \DateTime(datetime: $row['delivered_at'], timezone: new \DateTimeZone(timezone: 'UTC'));

        return new NotificationView(
            id: $row['id'],
            type: $row['type'],
            module: NotificationType::tryFrom(value: $row['type'])?->module() ?? '',
            params: json_decode(json: (string) $row['params'], associative: true) ?? [],
            title: $row['title'],
            body: $row['body'],
            url: $row['url'],
            pushed: (bool) $row['pushed'],
            unread: null === $row['read_at'],
            deliveredAt: $deliveredAt,
        );
    }
}
