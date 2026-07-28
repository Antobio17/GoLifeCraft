<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;

final readonly class DoctrineMenuItemRowLoader
{
    public function __construct(private Connection $connection)
    {
    }

    /**
     * @param array<int, string> $menuIds
     *
     * @return array<string, array<int, array{id: string, dayKey: ?string, meal: string, kind: string, refId: string, quantity: float, unit: ?string, position: int}>>
     */
    public function loadByMenuIds(array $menuIds): array
    {
        if ([] === $menuIds) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('mi.id', 'mi.menu_id', 'mi.day_key', 'mi.meal', 'mi.kind', 'mi.ref_id', 'mi.quantity', 'mi.unit', 'mi.position')
            ->from(table: 'menu_item', alias: 'mi')
            ->where('mi.menu_id IN (:menuIds)')
            ->setParameter(key: 'menuIds', value: $menuIds, type: ArrayParameterType::STRING)
            ->orderBy(sort: 'mi.position', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $items = [];

        foreach ($rows as $row) {
            $items[$row['menu_id']][] = [
                'id' => $row['id'],
                'dayKey' => null !== $row['day_key'] ? (string) $row['day_key'] : null,
                'meal' => (string) $row['meal'],
                'kind' => (string) $row['kind'],
                'refId' => (string) $row['ref_id'],
                'quantity' => (float) $row['quantity'],
                'unit' => null !== $row['unit'] ? (string) $row['unit'] : null,
                'position' => (int) $row['position'],
            ];
        }

        return $items;
    }
}
