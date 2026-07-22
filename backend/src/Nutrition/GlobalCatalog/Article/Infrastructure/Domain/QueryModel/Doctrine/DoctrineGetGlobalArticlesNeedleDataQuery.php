<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticlesResult;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\GetGlobalArticlesNeedleDataQuery;

final readonly class DoctrineGetGlobalArticlesNeedleDataQuery implements GetGlobalArticlesNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findGlobalArticles(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $filterSource = null,
        ?string $orderBy = null,
    ): array {
        $qb = $this->getBaseQuery(filterName: $filterName, filterSource: $filterSource)
            ->select(
                't.id',
                't.barcode',
                't.name',
                't.brand',
                't.category_name',
                't.image_url',
                't.quantity',
                't.stores',
                't.source',
                't.reference_amount',
                't.calories',
                't.protein',
                't.carbs',
                't.sugars',
                't.fat',
                't.saturated_fat',
                't.fiber',
                't.salt',
            );

        $this->applyOrdering(qb: $qb, orderBy: $orderBy);

        $rows = $qb->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(callback: static fn (array $row): GetGlobalArticlesResult => new GetGlobalArticlesResult(
            id: $row['id'],
            aggregateName: 'GlobalArticle',
            barcode: $row['barcode'],
            name: $row['name'],
            brand: $row['brand'],
            categoryName: $row['category_name'],
            imageUrl: $row['image_url'],
            quantity: $row['quantity'],
            stores: $row['stores'],
            source: $row['source'],
            referenceAmount: (float) $row['reference_amount'],
            calories: null !== $row['calories'] ? (float) $row['calories'] : null,
            protein: null !== $row['protein'] ? (float) $row['protein'] : null,
            carbs: null !== $row['carbs'] ? (float) $row['carbs'] : null,
            sugars: null !== $row['sugars'] ? (float) $row['sugars'] : null,
            fat: null !== $row['fat'] ? (float) $row['fat'] : null,
            saturatedFat: null !== $row['saturated_fat'] ? (float) $row['saturated_fat'] : null,
            fiber: null !== $row['fiber'] ? (float) $row['fiber'] : null,
            salt: null !== $row['salt'] ? (float) $row['salt'] : null,
        ), array: $rows);
    }

    public function totalGlobalArticles(
        ?string $filterName = null,
        ?string $filterSource = null,
    ): int {
        return (int) $this->getBaseQuery(filterName: $filterName, filterSource: $filterSource)
            ->select('COUNT(*)')
            ->executeQuery()
            ->fetchOne();
    }

    private function getBaseQuery(?string $filterName = null, ?string $filterSource = null): QueryBuilder
    {
        $qb = $this->connection->createQueryBuilder()
            ->from(table: 'global_article', alias: 't');

        if (null !== $filterName) {
            $qb->andWhere('t.name LIKE :name OR t.brand LIKE :name')
                ->setParameter(key: 'name', value: '%'.$filterName.'%');
        }

        if (null !== $filterSource) {
            $qb->andWhere('t.source = :source')
                ->setParameter(key: 'source', value: $filterSource);
        }

        return $qb;
    }

    private function applyOrdering(QueryBuilder $qb, ?string $orderBy): void
    {
        $allowedFields = [
            'name' => 't.name',
            'updatedAt' => 't.updated_at',
        ];

        $field = $orderBy ?? 'name';
        $direction = 'ASC';

        if (null !== $orderBy && str_starts_with(haystack: $orderBy, needle: '-')) {
            $direction = 'DESC';
            $field = substr(string: $orderBy, offset: 1);
        }

        $column = $allowedFields[$field] ?? 't.name';

        $qb->orderBy(sort: $column, order: $direction);
    }
}
