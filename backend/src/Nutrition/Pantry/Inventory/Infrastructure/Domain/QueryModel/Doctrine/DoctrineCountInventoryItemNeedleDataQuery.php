<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Inventory\Domain\QueryModel\CountInventoryItemNeedleDataQuery;

final readonly class DoctrineCountInventoryItemNeedleDataQuery implements CountInventoryItemNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function baseUnitFactor(string $articleId, string $unit): ?float
    {
        $baseUnit = $this->connection->createQueryBuilder()
            ->select('a.base_unit')
            ->from(table: 'article', alias: 'a')
            ->where('a.id = :articleId')
            ->setParameter(key: 'articleId', value: $articleId)
            ->executeQuery()
            ->fetchOne();

        if (false === $baseUnit) {
            return null;
        }

        if ($unit === $baseUnit) {
            return 1.0;
        }

        $factor = $this->connection->createQueryBuilder()
            ->select('e.quantity')
            ->from(table: 'article_equivalence', alias: 'e')
            ->where('e.article_id = :articleId')
            ->andWhere('e.unit = :unit')
            ->andWhere('e.quantity > 0')
            ->orderBy(sort: 'e.quantity', order: 'ASC')
            ->setParameter(key: 'articleId', value: $articleId)
            ->setParameter(key: 'unit', value: $unit)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false === $factor ? null : (float) $factor;
    }
}
