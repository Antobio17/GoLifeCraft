<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Location\Domain\QueryModel\UpdateLocationNeedleDataQuery;

final readonly class DoctrineUpdateLocationNeedleDataQuery implements UpdateLocationNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function alreadyExists(string $name, string $locationId): bool
    {
        $result = $this->connection->createQueryBuilder()
            ->select('l.id')
            ->from(table: 'pantry_location', alias: 'l')
            ->where('l.name = :name')
            ->andWhere('l.id != :locationId')
            ->setParameter(key: 'name', value: $name)
            ->setParameter(key: 'locationId', value: $locationId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false !== $result;
    }
}
