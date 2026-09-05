<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Stock\Domain\Service\ArticleStockUnitConverter;

final readonly class DoctrineArticleStockUnitConverter implements ArticleStockUnitConverter
{
    public function __construct(private Connection $connection)
    {
    }

    public function toBaseUnits(string $articleId, float $quantity, ?string $unit): float
    {
        if (null === $unit || '' === $unit) {
            return $quantity;
        }

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

        if (false === $factor) {
            return $quantity;
        }

        return $quantity * (float) $factor;
    }
}
