<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\QueryModel\FindDiaryEntriesByDateNeedleDataQuery;

final readonly class DoctrineFindDiaryEntriesByDateNeedleDataQuery implements FindDiaryEntriesByDateNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findEntryIdsByDate(array $dates): array
    {
        if ([] === $dates) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('e.id', 'e.entry_date')
            ->from(table: 'diary_entry', alias: 'e')
            ->where('e.entry_date IN (:dates)')
            ->setParameter(key: 'dates', value: $dates, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $entryIds = [];

        foreach ($rows as $row) {
            $entryIds[$row['entry_date']][] = $row['id'];
        }

        return $entryIds;
    }
}
