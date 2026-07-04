<?php

namespace Nutrition\Catalog\Category\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Nutrition\Catalog\Category\Domain\QueryModel\Dto\GetCategoriesResult;
use Nutrition\Catalog\Category\Domain\QueryModel\GetCategoriesNeedleDataQuery;

final readonly class DoctrineGetCategoriesNeedleDataQuery implements GetCategoriesNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findCategories(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $orderBy = null,
    ): array {
        $qb = $this->getBaseQuery(filterName: $filterName);

        if (null !== $orderBy) {
            $this->applyOrdering(qb: $qb, orderBy: $orderBy);
        }

        $result = $qb->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: function ($row) use ($utc): GetCategoriesResult {
            return new GetCategoriesResult(
                id: $row['id'],
                aggregateName: 'Category',
                name: $row['name'],
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            );
        }, array: $result);
    }

    public function totalCategories(
        ?string $filterName = null,
    ): int {
        $qb = $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'category', alias: 't');

        if (null !== $filterName) {
            $qb->andWhere('t.name LIKE :name')
                ->setParameter(key: 'name', value: '%'.$filterName.'%');
        }

        return (int) $qb->executeQuery()->fetchOne();
    }

    private function getBaseQuery(?string $filterName = null): QueryBuilder
    {
        $qb = $this->connection->createQueryBuilder()
            ->select(
                't.id',
                't.name',
                't.created_at',
                't.updated_at',
                't.created_by_user_id',
                't.updated_by_user_id',
            )
            ->from(table: 'category', alias: 't');

        if (null !== $filterName) {
            $qb->andWhere('t.name LIKE :name')
                ->setParameter(key: 'name', value: '%'.$filterName.'%');
        }

        return $qb;
    }

    private function applyOrdering(QueryBuilder $qb, string $orderBy): void
    {
        $direction = 'ASC';
        $field = $orderBy;

        if (str_starts_with(haystack: $orderBy, needle: '-')) {
            $direction = 'DESC';
            $field = substr(string: $orderBy, offset: 1);
        }

        $allowedFields = [
            'name' => 't.name',
            'createdAt' => 't.created_at',
            'updatedAt' => 't.updated_at',
        ];

        if (!isset($allowedFields[$field])) {
            return;
        }

        $qb->orderBy(sort: $allowedFields[$field], order: $direction);
    }
}
