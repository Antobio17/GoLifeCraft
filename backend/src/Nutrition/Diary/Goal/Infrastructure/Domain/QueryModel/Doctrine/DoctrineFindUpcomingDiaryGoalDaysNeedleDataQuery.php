<?php

namespace Nutrition\Diary\Goal\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Diary\Goal\Domain\QueryModel\FindUpcomingDiaryGoalDaysNeedleDataQuery;

final readonly class DoctrineFindUpcomingDiaryGoalDaysNeedleDataQuery implements FindUpcomingDiaryGoalDaysNeedleDataQuery
{
    private const string TIMEZONE = 'Europe/Madrid';

    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findUpcomingDates(): array
    {
        return $this->connection->createQueryBuilder()
            ->select('d.entry_date')
            ->from(table: 'diary_goal_day', alias: 'd')
            ->where('d.entry_date >= :today')
            ->setParameter(key: 'today', value: $this->today())
            ->executeQuery()
            ->fetchFirstColumn();
    }

    private function today(): string
    {
        return (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: self::TIMEZONE)))
            ->format(format: 'Y-m-d');
    }
}
