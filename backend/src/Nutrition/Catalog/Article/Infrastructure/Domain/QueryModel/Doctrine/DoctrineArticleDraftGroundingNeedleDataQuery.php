<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Article\Domain\QueryModel\ArticleDraftGroundingNeedleDataQuery;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftGrounding;

final readonly class DoctrineArticleDraftGroundingNeedleDataQuery implements ArticleDraftGroundingNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function load(): ArticleDraftGrounding
    {
        return new ArticleDraftGrounding(
            categories: $this->namesById(table: 'category'),
            supermarkets: $this->namesById(table: 'supermarket'),
            aisles: $this->aisles(),
        );
    }

    /**
     * @return array<string, string>
     */
    private function namesById(string $table): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.id', 't.name')
            ->from(table: $table, alias: 't')
            ->orderBy(sort: 't.name', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $namesById = [];
        foreach ($rows as $row) {
            $namesById[$row['id']] = $row['name'];
        }

        return $namesById;
    }

    /**
     * @return array<string, array<string, string>>
     */
    private function aisles(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.id', 't.name', 't.supermarket_id')
            ->from(table: 'supermarket_aisle', alias: 't')
            ->orderBy(sort: 't.supermarket_id', order: 'ASC')
            ->addOrderBy(sort: 't.position', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $aisles = [];
        foreach ($rows as $row) {
            $aisles[$row['supermarket_id']][$row['id']] = $row['name'];
        }

        return $aisles;
    }
}
