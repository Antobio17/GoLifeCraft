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
     * @return array<string, array<int, array{id: string, dayKey: ?string, meal: string, kind: string, refId: string, quantity: float, unit: ?string, position: int, customized: bool, nodes: array<int, array<string, mixed>>}>>
     */
    public function loadByMenuIds(array $menuIds): array
    {
        if ([] === $menuIds) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('mi.id', 'mi.menu_id', 'mi.day_key', 'mi.meal', 'mi.kind', 'mi.ref_id', 'mi.quantity', 'mi.unit', 'mi.position', 'mi.customized')
            ->from(table: 'menu_item', alias: 'mi')
            ->where('mi.menu_id IN (:menuIds)')
            ->setParameter(key: 'menuIds', value: $menuIds, type: ArrayParameterType::STRING)
            ->orderBy(sort: 'mi.position', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $nodesByItem = $this->loadNodes(menuItemIds: array_column(array: $rows, column_key: 'id'));
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
                'customized' => (bool) $row['customized'],
                'nodes' => $nodesByItem[$row['id']] ?? [],
            ];
        }

        return $items;
    }

    /**
     * @param array<int, string> $menuItemIds
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function loadNodes(array $menuItemIds): array
    {
        if ([] === $menuItemIds) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('n.menu_item_id', 'n.path', 'n.depth', 'n.position', 'n.kind', 'n.ref_id', 'n.quantity', 'n.unit', 'n.snapshot_name', 'n.snapshot_emoji', 'n.snapshot_calories', 'n.snapshot_protein', 'n.snapshot_fat', 'n.snapshot_carbs')
            ->from(table: 'menu_item_node', alias: 'n')
            ->where('n.menu_item_id IN (:menuItemIds)')
            ->setParameter(key: 'menuItemIds', value: $menuItemIds, type: ArrayParameterType::STRING)
            ->orderBy(sort: 'n.depth', order: 'ASC')
            ->addOrderBy(sort: 'n.path', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $byItem = [];

        foreach ($rows as $row) {
            $byItem[$row['menu_item_id']][] = $row;
        }

        return $byItem;
    }
}
