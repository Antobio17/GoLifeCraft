<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationsResult;
use Nutrition\Pantry\Location\Domain\QueryModel\GetLocationsNeedleDataQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Search\SearchFilter;

final readonly class DoctrineGetLocationsNeedleDataQuery implements GetLocationsNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findLocations(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $orderBy = null,
    ): array {
        $qb = $this->getBaseQuery(filterName: $filterName);

        $this->applyOrdering(qb: $qb, orderBy: $orderBy);

        $rows = $qb->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: static function (array $row) use ($utc): GetLocationsResult {
            return new GetLocationsResult(
                id: $row['id'],
                aggregateName: 'PantryLocation',
                name: $row['name'],
                emoji: (string) ($row['emoji'] ?? ''),
                description: (string) ($row['description'] ?? ''),
                articleCount: (int) $row['article_count'],
                recipeCount: (int) $row['recipe_count'],
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            );
        }, array: $rows);
    }

    public function totalLocations(?string $filterName = null): int
    {
        $qb = $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'pantry_location', alias: 'l');

        SearchFilter::apply(queryBuilder: $qb, needle: $filterName, columns: ['l.name']);

        return (int) $qb->executeQuery()->fetchOne();
    }

    private function getBaseQuery(?string $filterName = null): QueryBuilder
    {
        $qb = $this->connection->createQueryBuilder()
            ->select(
                'l.id',
                'l.name',
                'l.emoji',
                'l.description',
                'l.created_at',
                'l.updated_at',
                'l.created_by_user_id',
                'l.updated_by_user_id',
                '(SELECT COUNT(*) FROM article_stock s WHERE s.location_id = l.id) AS article_count',
                '(SELECT COUNT(*) FROM recipe_stock r WHERE r.location_id = l.id) AS recipe_count',
            )
            ->from(table: 'pantry_location', alias: 'l');

        SearchFilter::apply(queryBuilder: $qb, needle: $filterName, columns: ['l.name']);

        return $qb;
    }

    private function applyOrdering(QueryBuilder $qb, ?string $orderBy): void
    {
        $allowedFields = [
            'name' => 'l.name',
            'createdAt' => 'l.created_at',
            'updatedAt' => 'l.updated_at',
        ];

        if (null === $orderBy) {
            $qb->orderBy(sort: 'l.name', order: 'ASC');

            return;
        }

        $direction = 'ASC';
        $field = $orderBy;

        if (str_starts_with(haystack: $orderBy, needle: '-')) {
            $direction = 'DESC';
            $field = substr(string: $orderBy, offset: 1);
        }

        if (!isset($allowedFields[$field])) {
            $qb->orderBy(sort: 'l.name', order: 'ASC');

            return;
        }

        $qb->orderBy(sort: $allowedFields[$field], order: $direction);
    }
}
