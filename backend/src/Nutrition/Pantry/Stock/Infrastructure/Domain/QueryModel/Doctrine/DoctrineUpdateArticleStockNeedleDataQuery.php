<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Stock\Domain\QueryModel\UpdateArticleStockNeedleDataQuery;

final readonly class DoctrineUpdateArticleStockNeedleDataQuery implements UpdateArticleStockNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function articleExists(string $articleId): bool
    {
        $result = $this->connection->createQueryBuilder()
            ->select('a.id')
            ->from(table: 'article', alias: 'a')
            ->where('a.id = :articleId')
            ->setParameter(key: 'articleId', value: $articleId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false !== $result;
    }
}
