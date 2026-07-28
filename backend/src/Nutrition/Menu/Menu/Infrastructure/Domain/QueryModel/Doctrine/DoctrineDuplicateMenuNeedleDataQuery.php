<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuItemSnapshot;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuSnapshot;
use Nutrition\Menu\Menu\Domain\QueryModel\DuplicateMenuNeedleDataQuery;

final readonly class DoctrineDuplicateMenuNeedleDataQuery implements DuplicateMenuNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineMenuItemRowLoader $itemRowLoader,
    ) {
    }

    public function findMenuSnapshot(string $menuId): ?MenuSnapshot
    {
        $row = $this->connection->createQueryBuilder()
            ->select('m.id', 'm.name', 'm.emoji', 'm.note', 'm.type')
            ->from(table: 'menu', alias: 'm')
            ->where('m.id = :menuId')
            ->setParameter(key: 'menuId', value: $menuId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $items = $this->itemRowLoader->loadByMenuIds(menuIds: [$menuId])[$menuId] ?? [];

        return new MenuSnapshot(
            id: $row['id'],
            name: $row['name'],
            emoji: $row['emoji'],
            note: $row['note'],
            type: $row['type'],
            items: array_map(
                callback: static fn (array $item): MenuItemSnapshot => new MenuItemSnapshot(
                    dayKey: $item['dayKey'],
                    meal: $item['meal'],
                    kind: $item['kind'],
                    refId: $item['refId'],
                    quantity: $item['quantity'],
                    unit: $item['unit'],
                    position: $item['position'],
                ),
                array: $items,
            ),
        );
    }
}
