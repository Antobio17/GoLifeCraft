<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Notification\Notification\Inbox\Domain\QueryModel\DispatchDueNotificationsNeedleDataQuery;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\AgendaAppointment;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\DiaryMealEntry;

final readonly class DoctrineDispatchDueNotificationsNeedleDataQuery implements DispatchDueNotificationsNeedleDataQuery
{
    private const string APPOINTMENT_KIND = 'appointment';
    private const string QUICK_KIND = 'quick';

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

    public function diaryEntries(string $date): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('e.meal', 'e.kind', 'e.snapshot_name', 'e.snapshot_emoji', 'e.quick_name', 'e.quick_emoji')
            ->from(table: 'diary_entry', alias: 'e')
            ->where('e.entry_date = :date')
            ->setParameter(key: 'date', value: $date)
            ->orderBy(sort: 'e.created_at')
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(
            callback: static fn (array $row): DiaryMealEntry => new DiaryMealEntry(
                meal: $row['meal'],
                name: self::QUICK_KIND === $row['kind'] ? $row['quick_name'] : $row['snapshot_name'],
                emoji: self::QUICK_KIND === $row['kind'] ? $row['quick_emoji'] : $row['snapshot_emoji'],
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
