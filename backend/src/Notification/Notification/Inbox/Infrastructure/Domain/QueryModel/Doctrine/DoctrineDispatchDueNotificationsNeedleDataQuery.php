<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Notification\Notification\Inbox\Domain\QueryModel\DispatchDueNotificationsNeedleDataQuery;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\AgendaAppointment;

final readonly class DoctrineDispatchDueNotificationsNeedleDataQuery implements DispatchDueNotificationsNeedleDataQuery
{
    private const string APPOINTMENT_KIND = 'appointment';

    public function __construct(
        private Connection $connection,
    ) {
    }

    public function pendingAppointments(string $fromDate, string $toDate): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('e.id', 'e.entry_date', 'e.entry_time', 'e.title', 'e.created_at')
            ->from(table: 'agenda_entry', alias: 'e')
            ->where('e.entry_date BETWEEN :from AND :to')
            ->andWhere('e.kind = :kind')
            ->andWhere('e.done = 0')
            ->setParameter(key: 'from', value: $fromDate)
            ->setParameter(key: 'to', value: $toDate)
            ->setParameter(key: 'kind', value: self::APPOINTMENT_KIND)
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(
            callback: static fn (array $row): AgendaAppointment => new AgendaAppointment(
                id: $row['id'],
                entryDate: $row['entry_date'],
                time: $row['entry_time'],
                title: $row['title'],
                createdAt: new \DateTimeImmutable(datetime: $row['created_at'], timezone: new \DateTimeZone(timezone: 'UTC')),
            ),
            array: $rows,
        );
    }

    public function deliveredDedupeKeys(array $dedupeKeys): array
    {
        if ([] === $dedupeKeys) {
            return [];
        }

        return $this->connection->createQueryBuilder()
            ->select('n.dedupe_key')
            ->from(table: 'notification', alias: 'n')
            ->where('n.dedupe_key IN (:dedupeKeys)')
            ->setParameter(key: 'dedupeKeys', value: array_values(array: $dedupeKeys), type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchFirstColumn();
    }
}
