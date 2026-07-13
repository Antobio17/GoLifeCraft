<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Article\Domain\QueryModel\UpdateArticleNeedleDataQuery;

final readonly class DoctrineUpdateArticleNeedleDataQuery implements UpdateArticleNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function articleWithNameAlreadyExists(
        string $name,
        string $excludingArticleId,
    ): bool {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'article', alias: 'a')
            ->where('a.name = :name')
            ->andWhere('a.id != :excludingId')
            ->setParameter(key: 'name', value: $name)
            ->setParameter(key: 'excludingId', value: $excludingArticleId)
            ->executeQuery()
            ->fetchOne() > 0;
    }
}
