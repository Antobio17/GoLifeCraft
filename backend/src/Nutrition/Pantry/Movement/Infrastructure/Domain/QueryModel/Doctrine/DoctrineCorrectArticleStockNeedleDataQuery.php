<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Movement\Domain\Model\ArticleStockReference;
use Nutrition\Pantry\Movement\Domain\QueryModel\CorrectArticleStockNeedleDataQuery;

final readonly class DoctrineCorrectArticleStockNeedleDataQuery implements CorrectArticleStockNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findArticleReference(string $articleId): ?ArticleStockReference
    {
        $row = $this->connection->createQueryBuilder()
            ->select('a.id', 'a.pack_unit', 'e.quantity AS pack_size', 's.reference_quantity')
            ->from(table: 'article', alias: 'a')
            ->leftJoin('a', 'article_equivalence', 'e', 'e.article_id = a.id AND e.unit = a.pack_unit')
            ->leftJoin('a', 'article_stock', 's', 's.article_id = a.id')
            ->where('a.id = :articleId')
            ->setParameter(key: 'articleId', value: $articleId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        return new ArticleStockReference(
            articleId: (string) $row['id'],
            packUnit: null !== $row['pack_unit'] ? (string) $row['pack_unit'] : null,
            packSize: null !== $row['pack_size'] ? (float) $row['pack_size'] : null,
            referenceQuantity: null !== $row['reference_quantity'] ? (float) $row['reference_quantity'] : null,
        );
    }
}
