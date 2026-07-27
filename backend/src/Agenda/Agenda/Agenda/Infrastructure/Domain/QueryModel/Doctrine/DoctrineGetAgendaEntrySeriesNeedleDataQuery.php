<?php

namespace Agenda\Agenda\Agenda\Infrastructure\Domain\QueryModel\Doctrine;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaEntrySeriesResult;
use Agenda\Agenda\Agenda\Domain\QueryModel\GetAgendaEntrySeriesNeedleDataQuery;
use Doctrine\DBAL\Connection;

final readonly class DoctrineGetAgendaEntrySeriesNeedleDataQuery implements GetAgendaEntrySeriesNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findSeriesById(string $seriesId): ?GetAgendaEntrySeriesResult
    {
        if ('' === $seriesId) {
            return null;
        }

        $rows = $this->connection->createQueryBuilder()
            ->select(
                'e.entry_date',
                'e.title',
                'e.kind',
                'e.category',
                'e.notes',
                'e.done',
            )
            ->from(table: 'agenda_entry', alias: 'e')
            ->where('e.series_id = :seriesId')
            ->setParameter(key: 'seriesId', value: $seriesId)
            ->orderBy('e.entry_date', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        if ([] === $rows) {
            return null;
        }

        $first = $rows[0];
        $last = $rows[count(value: $rows) - 1];
        $pendingCount = 0;

        foreach ($rows as $row) {
            $pendingCount += (bool) $row['done'] ? 0 : 1;
        }

        return new GetAgendaEntrySeriesResult(
            id: $seriesId,
            aggregateName: 'AgendaEntrySeries',
            seriesId: $seriesId,
            entryDate: $first['entry_date'],
            endDate: $last['entry_date'],
            title: $first['title'],
            kind: $first['kind'],
            category: (string) $first['category'],
            notes: (string) $first['notes'],
            entryCount: count(value: $rows),
            pendingCount: $pendingCount,
            doneCount: count(value: $rows) - $pendingCount,
        );
    }
}
