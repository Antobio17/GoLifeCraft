<?php

namespace Nutrition\Catalog\Supermarket\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Supermarket\Domain\QueryModel\Dto\GetSupermarketResult;
use Nutrition\Catalog\Supermarket\Domain\QueryModel\GetSupermarketNeedleDataQuery;

final readonly class DoctrineGetSupermarketNeedleDataQuery implements GetSupermarketNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findSupermarketById(string $supermarketId): ?GetSupermarketResult
    {
        $result = $this->connection->createQueryBuilder()
            ->select(
                't.id',
                't.name',
                't.created_at',
                't.updated_at',
                't.created_by_user_id',
                't.updated_by_user_id',
            )
            ->from(table: 'supermarket', alias: 't')
            ->where('t.id = :id')
            ->setParameter(key: 'id', value: $supermarketId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $result) {
            return null;
        }

        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetSupermarketResult(
            id: $result['id'],
            aggregateName: 'Supermarket',
            name: $result['name'],
            aisles: $this->fetchAisles(supermarketId: $result['id']),
            createdAt: new \DateTime(datetime: $result['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $result['updated_at'], timezone: $utc),
            createdByUserId: $result['created_by_user_id'],
            updatedByUserId: $result['updated_by_user_id'],
        );
    }

    /**
     * @return array<int, array{id: string, name: string, position: int}>
     */
    private function fetchAisles(string $supermarketId): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('a.id', 'a.name', 'a.position')
            ->from(table: 'supermarket_aisle', alias: 'a')
            ->where('a.supermarket_id = :supermarketId')
            ->setParameter(key: 'supermarketId', value: $supermarketId)
            ->orderBy(sort: 'a.position', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(
            callback: static fn (array $row): array => [
                'id' => $row['id'],
                'name' => $row['name'],
                'position' => (int) $row['position'],
            ],
            array: $rows,
        );
    }
}
