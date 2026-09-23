<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Article\Domain\Model\ArticlePack;
use Nutrition\Pantry\Stock\Domain\QueryModel\UpdateArticleStockNeedleDataQuery;

final readonly class DoctrineUpdateArticleStockNeedleDataQuery implements UpdateArticleStockNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findArticlePack(string $articleId): ?ArticlePack
    {
        $row = $this->connection->createQueryBuilder()
            ->select('a.id', 'e.unit AS pack_unit', 'e.quantity AS pack_size')
            ->from(table: 'article', alias: 'a')
            ->leftJoin('a', 'article_equivalence', 'e', 'e.article_id = a.id AND e.unit = a.pack_unit')
            ->where('a.id = :articleId')
            ->setParameter(key: 'articleId', value: $articleId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        return ArticlePack::fromEquivalence(
            unit: null !== $row['pack_unit'] ? (string) $row['pack_unit'] : null,
            size: null !== $row['pack_size'] ? (float) $row['pack_size'] : null,
        );
    }
}
