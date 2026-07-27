<?php

namespace Agenda\Agenda\Agenda\Infrastructure\Domain\QueryModel\Doctrine;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\AgendaEntryView;
use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaUpcomingResult;
use Agenda\Agenda\Agenda\Domain\QueryModel\GetAgendaUpcomingNeedleDataQuery;
use Doctrine\DBAL\Connection;

final readonly class DoctrineGetAgendaUpcomingNeedleDataQuery implements GetAgendaUpcomingNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findUpcoming(string $fromDate, int $days): GetAgendaUpcomingResult
    {
        $toDate = (new \DateTimeImmutable(datetime: $fromDate))
            ->modify(modifier: sprintf('+%d days', max(1, $days) - 1))
            ->format(format: 'Y-m-d');

        $rows = $this->connection->createQueryBuilder()
            ->select(
                'e.id',
                'e.entry_date',
                'e.entry_time',
                'e.title',
                'e.kind',
                'e.category',
                'e.notes',
                'e.done',
            )
            ->from(table: 'agenda_entry', alias: 'e')
            ->where('e.entry_date BETWEEN :from AND :to')
            ->setParameter(key: 'from', value: $fromDate)
            ->setParameter(key: 'to', value: $toDate)
            ->orderBy('e.entry_date', 'ASC')
            ->addOrderBy('e.done', 'ASC')
            ->addOrderBy('COALESCE(e.entry_time, \'99:99\')', 'ASC')
            ->addOrderBy('e.created_at', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $entries = [];
        $pendingCount = 0;

        foreach ($rows as $row) {
            $done = (bool) $row['done'];
            $pendingCount += $done ? 0 : 1;

            $entries[] = new AgendaEntryView(
                id: $row['id'],
                entryDate: $row['entry_date'],
                time: $row['entry_time'],
                title: $row['title'],
                kind: $row['kind'],
                category: (string) $row['category'],
                notes: (string) $row['notes'],
                done: $done,
            );
        }

        return new GetAgendaUpcomingResult(
            id: sprintf('%s..%s', $fromDate, $toDate),
            aggregateName: 'AgendaUpcoming',
            fromDate: $fromDate,
            toDate: $toDate,
            entries: $entries,
            entryCount: count(value: $entries),
            pendingCount: $pendingCount,
            doneCount: count(value: $entries) - $pendingCount,
        );
    }
}
