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
        $factor = $this->connection->createQueryBuilder()
            ->select('e.quantity')
            ->from(table: 'article_equivalence', alias: 'e')
            ->where('e.article_id = :articleId')
            ->andWhere('e.unit = :unit')
            ->setParameter(key: 'articleId', value: $articleId)
            ->setParameter(key: 'unit', value: $unit)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false === $factor ? null : (float) $factor;
    }
}
