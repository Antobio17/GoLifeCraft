<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\QueryModel\ConsumeDiaryMealNeedleDataQuery;

final readonly class DoctrineConsumeDiaryMealNeedleDataQuery implements ConsumeDiaryMealNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findEntryIds(string $date, string $meal): array
    {
        return $this->connection->createQueryBuilder()
            ->select('d.id')
            ->from(table: 'diary_entry', alias: 'd')
            ->where('d.entry_date = :date')
            ->andWhere('d.meal = :meal')
            ->setParameter(key: 'date', value: $date)
            ->setParameter(key: 'meal', value: $meal)
            ->executeQuery()
            ->fetchFirstColumn();
    }
}
