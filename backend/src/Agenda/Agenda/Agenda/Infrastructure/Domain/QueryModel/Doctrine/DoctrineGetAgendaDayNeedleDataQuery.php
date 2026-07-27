<?php

namespace Agenda\Agenda\Agenda\Infrastructure\Domain\QueryModel\Doctrine;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\AgendaEntryView;
use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaDayResult;
use Agenda\Agenda\Agenda\Domain\QueryModel\GetAgendaDayNeedleDataQuery;
use Doctrine\DBAL\Connection;

final readonly class DoctrineGetAgendaDayNeedleDataQuery implements GetAgendaDayNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findDay(string $date): GetAgendaDayResult
    {
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
                'e.series_id',
            )
            ->from(table: 'agenda_entry', alias: 'e')
            ->where('e.entry_date = :date')
            ->setParameter(key: 'date', value: $date)
            ->orderBy('e.done', 'ASC')
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
                seriesId: $row['series_id'],
            );
        }

        return new GetAgendaDayResult(
            id: $date,
            aggregateName: 'AgendaDay',
            date: $date,
            entries: $entries,
            entryCount: count(value: $entries),
            pendingCount: $pendingCount,
            doneCount: count(value: $entries) - $pendingCount,
        );
    }
}
