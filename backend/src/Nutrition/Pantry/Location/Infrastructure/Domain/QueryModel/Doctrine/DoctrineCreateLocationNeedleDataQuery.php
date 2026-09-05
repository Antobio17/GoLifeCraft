<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Location\Domain\QueryModel\CreateLocationNeedleDataQuery;

final readonly class DoctrineCreateLocationNeedleDataQuery implements CreateLocationNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function alreadyExists(string $name): bool
    {
        $result = $this->connection->createQueryBuilder()
            ->select('l.id')
            ->from(table: 'pantry_location', alias: 'l')
            ->where('l.name = :name')
            ->setParameter(key: 'name', value: $name)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false !== $result;
    }
}
