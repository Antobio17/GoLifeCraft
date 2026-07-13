<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Article\Domain\QueryModel\CreateArticleNeedleDataQuery;

final readonly class DoctrineCreateArticleNeedleDataQuery implements CreateArticleNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function articleWithNameAlreadyExists(
        string $name,
    ): bool {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'article', alias: 'a')
            ->where('a.name = :name')
            ->setParameter(key: 'name', value: $name)
            ->executeQuery()
            ->fetchOne() > 0;
    }
}
