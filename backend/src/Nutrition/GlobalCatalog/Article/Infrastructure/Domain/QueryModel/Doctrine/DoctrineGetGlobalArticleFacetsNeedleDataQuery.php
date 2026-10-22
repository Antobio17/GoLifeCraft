<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GlobalArticleCategoryCount;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\GetGlobalArticleFacetsNeedleDataQuery;

final readonly class DoctrineGetGlobalArticleFacetsNeedleDataQuery implements GetGlobalArticleFacetsNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function categories(?string $filterSource = null): array
    {
        $qb = $this->connection->createQueryBuilder()
            ->select('t.category_name', 'COUNT(*) AS total')
            ->from(table: 'global_article', alias: 't')
            ->where('t.category_name IS NOT NULL')
            ->andWhere("t.category_name <> ''")
            ->groupBy('t.category_name')
            ->orderBy(sort: 't.category_name', order: 'ASC');

        if (null !== $filterSource) {
            $qb->andWhere('t.source = :source')
                ->setParameter(key: 'source', value: $filterSource);
        }

        return array_map(
            callback: static fn (array $row): GlobalArticleCategoryCount => new GlobalArticleCategoryCount(
                name: $row['category_name'],
                count: (int) $row['total'],
            ),
            array: $qb->executeQuery()->fetchAllAssociative(),
        );
    }
}
