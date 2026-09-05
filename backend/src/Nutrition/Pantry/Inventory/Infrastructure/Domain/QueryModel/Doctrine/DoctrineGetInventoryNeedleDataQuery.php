<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\GetInventoryResult;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryLocationItemView;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryLocationView;
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
                'i.note',
                'i.created_at',
                'i.updated_at',
                'i.created_by_user_id',
                'i.updated_by_user_id',
            )
            ->from(table: 'inventory', alias: 'i')
            ->where('i.id = :inventoryId')
            ->setParameter(key: 'inventoryId', value: $inventoryId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $locations = $this->locationsOf(inventoryId: $inventoryId);
        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetInventoryResult(
            id: $row['id'],
            aggregateName: 'Inventory',
            countedOn: $row['counted_on'],
            shift: $row['shift'],
            status: $row['status'],
            note: (string) ($row['note'] ?? ''),
            totalLocations: count(value: $locations),
            totalItems: self::sum(locations: $locations, field: 'totalItems'),
            countedItems: self::sum(locations: $locations, field: 'countedItems'),
            adjustedItems: self::sum(locations: $locations, field: 'adjustedItems'),
            locations: $locations,
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }

    /**
     * @return InventoryLocationView[]
     */
    private function locationsOf(string $inventoryId): array
    {
        $itemsByLocation = $this->itemsOf(inventoryId: $inventoryId);

        $rows = $this->connection->createQueryBuilder()
            ->select(
                'il.id',
                'il.position',
                'il.location_id',
                'il.name_snapshot',
                'il.emoji_snapshot',
                'l.id AS live_location_id',
            )
            ->from(table: 'inventory_location', alias: 'il')
            ->leftJoin(fromAlias: 'il', join: 'pantry_location', alias: 'l', condition: 'l.id = il.location_id')
            ->where('il.inventory_id = :inventoryId')
            ->orderBy(sort: 'il.position', order: 'ASC')
            ->setParameter(key: 'inventoryId', value: $inventoryId)
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(callback: static function (array $row) use ($itemsByLocation): InventoryLocationView {
            $items = $itemsByLocation[$row['id']] ?? [];

            return new InventoryLocationView(
                id: $row['id'],
                position: (int) $row['position'],
                locationId: $row['live_location_id'],
                name: $row['name_snapshot'],
                emoji: (string) ($row['emoji_snapshot'] ?? ''),
                totalItems: count(value: $items),
                countedItems: count(value: array_filter(
                    array: $items,
                    callback: static fn (InventoryLocationItemView $item): bool => null !== $item->countedQuantity,
                )),
                adjustedItems: count(value: array_filter(
                    array: $items,
                    callback: static fn (InventoryLocationItemView $item): bool => null !== $item->countedQuantity && 0.0 !== $item->difference,
                )),
                items: $items,
            );
        }, array: $rows);
    }

    /**
     * @return array<string, InventoryLocationItemView[]>
     */
    private function itemsOf(string $inventoryId): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'it.id',
                'it.inventory_location_id',
                'it.position',
                'it.kind',
                'it.ref_id',
                'it.name_snapshot',
                'it.emoji_snapshot',
                'it.unit',
                'it.expected_quantity',
                'it.counted_quantity',
            )
            ->from(table: 'inventory_location_item', alias: 'it')
            ->where('it.inventory_id = :inventoryId')
            ->orderBy(sort: 'it.position', order: 'ASC')
            ->setParameter(key: 'inventoryId', value: $inventoryId)
            ->executeQuery()
            ->fetchAllAssociative();

        $grouped = [];

        foreach ($rows as $row) {
            $expectedQuantity = (float) $row['expected_quantity'];
            $countedQuantity = null === $row['counted_quantity'] ? null : (float) $row['counted_quantity'];

            $grouped[$row['inventory_location_id']][] = new InventoryLocationItemView(
                id: $row['id'],
                position: (int) $row['position'],
                kind: $row['kind'],
                refId: $row['ref_id'],
                name: $row['name_snapshot'],
                emoji: (string) ($row['emoji_snapshot'] ?? ''),
                unit: $row['unit'],
                expectedQuantity: $expectedQuantity,
                countedQuantity: $countedQuantity,
                difference: null === $countedQuantity
                    ? 0.0
                    : round(num: $countedQuantity - $expectedQuantity, precision: InventoryLocationItem::QUANTITY_PRECISION),
            );
        }

        return $grouped;
    }

    /**
     * @param InventoryLocationView[] $locations
     */
    private static function sum(array $locations, string $field): int
    {
        return array_sum(array: array_map(
            callback: static fn (InventoryLocationView $location): int => $location->{$field},
            array: $locations,
        ));
    }
}
