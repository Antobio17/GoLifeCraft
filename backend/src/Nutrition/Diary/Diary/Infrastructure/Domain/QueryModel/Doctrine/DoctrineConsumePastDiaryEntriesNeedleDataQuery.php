<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\ParameterType;
use Nutrition\Diary\Diary\Domain\QueryModel\ConsumePastDiaryEntriesNeedleDataQuery;

final readonly class DoctrineConsumePastDiaryEntriesNeedleDataQuery implements ConsumePastDiaryEntriesNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findPendingEntryIds(string $fromDate, string $toDate): array
    {
        return $this->connection->createQueryBuilder()
            ->select('d.id')
            ->from(table: 'diary_entry', alias: 'd')
            ->where('d.entry_date >= :fromDate')
            ->andWhere('d.entry_date <= :toDate')
            ->andWhere('d.consumed = :consumed')
            ->setParameter(key: 'fromDate', value: $fromDate)
            ->setParameter(key: 'toDate', value: $toDate)
            ->setParameter(key: 'consumed', value: false, type: ParameterType::BOOLEAN)
            ->orderBy(sort: 'd.entry_date', order: 'ASC')
            ->executeQuery()
            ->fetchFirstColumn();
    }
}
