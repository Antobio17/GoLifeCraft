<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\GetInventoriesResult;
use Nutrition\Pantry\Inventory\Domain\QueryModel\GetInventoriesNeedleDataQuery;

final readonly class DoctrineGetInventoriesNeedleDataQuery implements GetInventoriesNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findInventories(
        int $pageSize,
        int $pageNumber,
        ?string $filterShift = null,
        ?string $filterStatus = null,
        ?string $orderBy = null,
    ): array {
        $qb = $this->getBaseQuery(filterShift: $filterShift, filterStatus: $filterStatus)
            ->select(
                'i.id',
                'i.counted_on',
                'i.shift',
                'i.status',
                'i.location_id',
                'i.note',
                'i.created_at',
                'i.updated_at',
                'i.created_by_user_id',
                'i.updated_by_user_id',
                'l.name AS location_name',
                '(SELECT COUNT(*) FROM inventory_line li WHERE li.inventory_id = i.id) AS total_lines',
                '(SELECT COUNT(*) FROM inventory_line li WHERE li.inventory_id = i.id AND li.counted_quantity IS NOT NULL) AS counted_lines',
                '(SELECT COUNT(*) FROM inventory_line li WHERE li.inventory_id = i.id AND li.counted_quantity IS NOT NULL AND li.counted_quantity <> li.expected_quantity) AS adjusted_lines',
            )
            ->leftJoin(fromAlias: 'i', join: 'pantry_location', alias: 'l', condition: 'l.id = i.location_id');

        $this->applyOrdering(qb: $qb, orderBy: $orderBy);

        $rows = $qb->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: static function (array $row) use ($utc): GetInventoriesResult {
            return new GetInventoriesResult(
                id: $row['id'],
                aggregateName: 'Inventory',
                countedOn: $row['counted_on'],
                shift: $row['shift'],
                status: $row['status'],
                locationId: $row['location_id'],
                locationName: $row['location_name'],
                note: (string) ($row['note'] ?? ''),
                totalLines: (int) $row['total_lines'],
                countedLines: (int) $row['counted_lines'],
                adjustedLines: (int) $row['adjusted_lines'],
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            );
        }, array: $rows);
    }

    public function totalInventories(
        ?string $filterShift = null,
        ?string $filterStatus = null,
    ): int {
        return (int) $this->getBaseQuery(filterShift: $filterShift, filterStatus: $filterStatus)
            ->select('COUNT(*)')
            ->executeQuery()
            ->fetchOne();
    }

    private function getBaseQuery(?string $filterShift, ?string $filterStatus): QueryBuilder
    {
        $qb = $this->connection->createQueryBuilder()->from(table: 'inventory', alias: 'i');

        if (null !== $filterShift) {
            $qb->andWhere('i.shift = :shift')->setParameter(key: 'shift', value: $filterShift);
        }

        if (null !== $filterStatus) {
            $qb->andWhere('i.status = :status')->setParameter(key: 'status', value: $filterStatus);
        }

        return $qb;
    }

    private function applyOrdering(QueryBuilder $qb, ?string $orderBy): void
    {
        $allowedFields = [
            'countedOn' => 'i.counted_on',
            'shift' => 'i.shift',
            'status' => 'i.status',
            'createdAt' => 'i.created_at',
            'updatedAt' => 'i.updated_at',
        ];

        $direction = 'ASC';
        $field = (string) $orderBy;

        if (str_starts_with(haystack: $field, needle: '-')) {
            $direction = 'DESC';
            $field = substr(string: $field, offset: 1);
        }

        if (!isset($allowedFields[$field])) {
            $qb->orderBy(sort: 'i.counted_on', order: 'DESC')->addOrderBy(sort: 'i.created_at', order: 'DESC');

            return;
        }

        $qb->orderBy(sort: $allowedFields[$field], order: $direction);
    }
}
