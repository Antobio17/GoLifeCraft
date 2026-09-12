<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\QueryModel\RegisterStockMovementNeedleDataQuery;

final readonly class DoctrineRegisterStockMovementNeedleDataQuery implements RegisterStockMovementNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function referenceExists(string $kind, string $refId): bool
    {
        $table = StockMovement::KIND_ARTICLE === $kind ? 'article' : 'recipe';

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
}
