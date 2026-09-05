<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLine;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\GetInventoryResult;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryLineView;
use Nutrition\Pantry\Inventory\Domain\QueryModel\GetInventoryNeedleDataQuery;

final readonly class DoctrineGetInventoryNeedleDataQuery implements GetInventoryNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findInventoryById(string $inventoryId): ?GetInventoryResult
    {
        $row = $this->connection->createQueryBuilder()
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
            )
            ->from(table: 'inventory', alias: 'i')
            ->leftJoin(fromAlias: 'i', join: 'pantry_location', alias: 'l', condition: 'l.id = i.location_id')
            ->where('i.id = :inventoryId')
            ->setParameter(key: 'inventoryId', value: $inventoryId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $lines = $this->linesOf(inventoryId: $inventoryId);
        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetInventoryResult(
            id: $row['id'],
            aggregateName: 'Inventory',
            countedOn: $row['counted_on'],
            shift: $row['shift'],
            status: $row['status'],
            locationId: $row['location_id'],
            locationName: $row['location_name'],
            note: (string) ($row['note'] ?? ''),
            totalLines: count(value: $lines),
            countedLines: count(value: array_filter(
                array: $lines,
                callback: static fn (InventoryLineView $line): bool => null !== $line->countedQuantity,
            )),
            adjustedLines: count(value: array_filter(
                array: $lines,
                callback: static fn (InventoryLineView $line): bool => null !== $line->countedQuantity && 0.0 !== $line->difference,
            )),
            lines: $lines,
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }

    /**
     * @return InventoryLineView[]
     */
    private function linesOf(string $inventoryId): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'li.id',
                'li.position',
                'li.kind',
                'li.ref_id',
                'li.location_id',
                'li.name_snapshot',
                'li.emoji_snapshot',
                'li.unit',
                'li.expected_quantity',
                'li.counted_quantity',
                'l.name AS location_name',
            )
            ->from(table: 'inventory_line', alias: 'li')
            ->leftJoin(fromAlias: 'li', join: 'pantry_location', alias: 'l', condition: 'l.id = li.location_id')
            ->where('li.inventory_id = :inventoryId')
            ->orderBy(sort: 'li.position', order: 'ASC')
            ->setParameter(key: 'inventoryId', value: $inventoryId)
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(callback: static function (array $row): InventoryLineView {
            $expectedQuantity = (float) $row['expected_quantity'];
            $countedQuantity = null === $row['counted_quantity'] ? null : (float) $row['counted_quantity'];

            return new InventoryLineView(
                id: $row['id'],
                position: (int) $row['position'],
                kind: $row['kind'],
                refId: $row['ref_id'],
                locationId: $row['location_id'],
                locationName: $row['location_name'],
                name: $row['name_snapshot'],
                emoji: (string) ($row['emoji_snapshot'] ?? ''),
                unit: $row['unit'],
                expectedQuantity: $expectedQuantity,
                countedQuantity: $countedQuantity,
                difference: null === $countedQuantity
                    ? 0.0
                    : round(num: $countedQuantity - $expectedQuantity, precision: InventoryLine::QUANTITY_PRECISION),
            );
        }, array: $rows);
    }
}
