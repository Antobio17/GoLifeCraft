<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionsResult;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetProductionsNeedleDataQuery;

final readonly class DoctrineGetProductionsNeedleDataQuery implements GetProductionsNeedleDataQuery
{
    private const array SORTABLE_COLUMNS = [
        'cookDate' => 'cook_date',
        'status' => 'status',
        'servingsCooked' => 'servings_cooked',
        'createdAt' => 'created_at',
    ];

    public function __construct(private Connection $connection)
    {
    }

    public function findProductions(int $pageSize, int $pageNumber, ?string $orderBy = null): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'p.id',
                'p.recipe_id',
                'p.cook_date',
                'p.status',
                'p.servings_cooked',
                'p.name_snapshot',
                'p.emoji_snapshot',
                'p.created_at',
                'p.updated_at',
                'p.created_by_user_id',
                'p.updated_by_user_id'
            )
            ->from(table: 'production', alias: 'p')
            ->orderBy(...$this->resolveOrderBy(orderBy: $orderBy))
            ->addOrderBy('p.created_at', 'DESC')
            ->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: static fn (array $row): GetProductionsResult => new GetProductionsResult(
            id: $row['id'],
            aggregateName: 'Production',
            recipeId: $row['recipe_id'],
            name: $row['name_snapshot'],
            emoji: $row['emoji_snapshot'],
            cookDate: $row['cook_date'],
            status: $row['status'],
            servingsCooked: (float) $row['servings_cooked'],
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        ), array: $rows);
    }

    public function totalProductions(): int
    {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(p.id)')
            ->from(table: 'production', alias: 'p')
            ->executeQuery()
            ->fetchOne();
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function resolveOrderBy(?string $orderBy): array
    {
        $descending = str_starts_with(haystack: (string) $orderBy, needle: '-');
        $field = ltrim(string: (string) $orderBy, characters: '-');
        $column = self::SORTABLE_COLUMNS[$field] ?? 'cook_date';

        return ['p.'.$column, $descending || null === $orderBy ? 'DESC' : 'ASC'];
    }
}
