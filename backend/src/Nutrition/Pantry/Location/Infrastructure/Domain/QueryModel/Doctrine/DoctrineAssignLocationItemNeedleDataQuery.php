<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Domain\QueryModel\AssignLocationItemNeedleDataQuery;

final readonly class DoctrineAssignLocationItemNeedleDataQuery implements AssignLocationItemNeedleDataQuery
{
    private const array REFERENCE_TABLES = [
        Location::ITEM_ARTICLE => 'article',
        Location::ITEM_RECIPE => 'recipe',
    ];

    public function __construct(private Connection $connection)
    {
    }

    public function referenceExists(string $kind, string $refId): bool
    {
        $table = self::REFERENCE_TABLES[$kind] ?? null;

        if (null === $table) {
            return false;
        }

        $result = $this->connection->createQueryBuilder()
            ->select('r.id')
            ->from(table: $table, alias: 'r')
            ->where('r.id = :refId')
            ->setParameter(key: 'refId', value: $refId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false !== $result;
    }

    public function currentLocationId(string $kind, string $refId): ?string
    {
        $result = $this->connection->createQueryBuilder()
            ->select('i.location_id')
            ->from(table: 'location_item', alias: 'i')
            ->where('i.kind = :kind')
            ->andWhere('i.ref_id = :refId')
            ->setParameter(key: 'kind', value: $kind)
            ->setParameter(key: 'refId', value: $refId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false === $result ? null : (string) $result;
    }
}
