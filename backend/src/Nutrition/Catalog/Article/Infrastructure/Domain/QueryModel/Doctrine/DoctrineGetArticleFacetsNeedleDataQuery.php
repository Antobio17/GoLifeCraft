<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Article\Domain\QueryModel\GetArticleFacetsNeedleDataQuery;

final readonly class DoctrineGetArticleFacetsNeedleDataQuery implements GetArticleFacetsNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function categories(): array
    {
        return $this->connection->createQueryBuilder()
            ->select('DISTINCT c.name')
            ->from(table: 'article', alias: 't')
            ->innerJoin(fromAlias: 't', join: 'category', alias: 'c', condition: 't.category_id = c.id')
            ->where('c.name IS NOT NULL')
            ->orderBy(sort: 'c.name', order: 'ASC')
            ->executeQuery()
            ->fetchFirstColumn();
    }

    public function brands(): array
    {
        return $this->connection->createQueryBuilder()
            ->select('DISTINCT t.brand')
            ->from(table: 'article', alias: 't')
            ->where('t.brand IS NOT NULL')
            ->andWhere("t.brand <> ''")
            ->orderBy(sort: 't.brand', order: 'ASC')
            ->executeQuery()
            ->fetchFirstColumn();
    }

    public function stores(): array
    {
        return $this->connection->createQueryBuilder()
            ->select('DISTINCT s.name')
            ->from(table: 'article', alias: 't')
            ->innerJoin(fromAlias: 't', join: 'supermarket', alias: 's', condition: 't.supermarket_id = s.id')
            ->where('s.name IS NOT NULL')
            ->orderBy(sort: 's.name', order: 'ASC')
            ->executeQuery()
            ->fetchFirstColumn();
    }
}
