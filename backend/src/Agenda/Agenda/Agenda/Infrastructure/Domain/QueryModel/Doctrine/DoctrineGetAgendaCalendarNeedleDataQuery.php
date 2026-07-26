<?php

namespace Agenda\Agenda\Agenda\Infrastructure\Domain\QueryModel\Doctrine;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\AgendaCalendarDay;
use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaCalendarResult;
use Agenda\Agenda\Agenda\Domain\QueryModel\GetAgendaCalendarNeedleDataQuery;
use Doctrine\DBAL\Connection;

final readonly class DoctrineGetAgendaCalendarNeedleDataQuery implements GetAgendaCalendarNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findMonthCounts(string $month): GetAgendaCalendarResult
    {
        [$year, $monthNumber] = $this->parseMonth(month: $month);
        $firstDay = sprintf('%04d-%02d-01', $year, $monthNumber);
        $lastDay = (new \DateTimeImmutable(datetime: $firstDay))
            ->modify(modifier: 'last day of this month')
            ->format(format: 'Y-m-d');

        $rows = $this->connection->createQueryBuilder()
            ->select('e.entry_date', 'COUNT(e.id) AS total', 'SUM(CASE WHEN e.done = 1 THEN 0 ELSE 1 END) AS pending')
            ->from(table: 'agenda_entry', alias: 'e')
            ->where('e.entry_date BETWEEN :first AND :last')
            ->setParameter(key: 'first', value: $firstDay)
            ->setParameter(key: 'last', value: $lastDay)
            ->groupBy('e.entry_date')
            ->executeQuery()
            ->fetchAllAssociative();

        $days = [];
        foreach ($rows as $row) {
            $days[] = new AgendaCalendarDay(
                date: $row['entry_date'],
                entryCount: (int) $row['total'],
                pendingCount: (int) $row['pending'],
            );
        }

        return new GetAgendaCalendarResult(
            id: sprintf('%04d-%02d', $year, $monthNumber),
            aggregateName: 'AgendaCalendar',
            month: sprintf('%04d-%02d', $year, $monthNumber),
            days: $days,
        );
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function parseMonth(string $month): array
    {
        if (1 === preg_match(pattern: '/^(\d{4})-(\d{2})$/', subject: $month, matches: $matches)) {
            return [(int) $matches[1], (int) $matches[2]];
        }

        $now = new \DateTimeImmutable(datetime: 'now', timezone: new \DateTimeZone(timezone: 'Europe/Madrid'));

        return [(int) $now->format(format: 'Y'), (int) $now->format(format: 'm')];
    }
}
