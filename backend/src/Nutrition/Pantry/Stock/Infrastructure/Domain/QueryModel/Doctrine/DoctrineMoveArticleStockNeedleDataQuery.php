<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Stock\Domain\QueryModel\MoveArticleStockNeedleDataQuery;

final readonly class DoctrineMoveArticleStockNeedleDataQuery implements MoveArticleStockNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function articleExists(string $articleId): bool
    {
        return $this->exists(table: 'article', id: $articleId);
    }

    public function locationExists(string $locationId): bool
    {
        return $this->exists(table: 'pantry_location', id: $locationId);
    }

    private function exists(string $table, string $id): bool
    {
        $result = $this->connection->createQueryBuilder()
            ->select('t.id')
            ->from(table: $table, alias: 't')
            ->where('t.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false !== $result;
    }
}
