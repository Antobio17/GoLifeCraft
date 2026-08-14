<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Nutrition\Menu\Menu\Domain\Model\MenuItemNode;
use Nutrition\Menu\Menu\Domain\Model\MenuRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineMenuRepository extends EntityRepository implements MenuRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Menu
    {
        $menu = $this->getEntityManager()->createQueryBuilder()
            ->select('menu')
            ->from(from: Menu::class, alias: 'menu')
            ->where('menu.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();

        if (null === $menu) {
            return null;
        }

        $menu->items = $this->findItems(menuId: $menu->id);

        foreach ($menu->items as $item) {
            $item->nodes = $this->findNodes(menuItemId: $item->id);
        }

        return $menu;
    }

    public function save(Menu $menu): void
    {
        $entityManager = $this->getEntityManager();
        $itemIds = array_map(callback: static fn (MenuItem $item): string => $item->id, array: $menu->items);

        $this->removeChildren(menuId: $menu->id, keptItemIds: $itemIds);
        $this->removeOrphanNodes(menuId: $menu->id, keptItemIds: $itemIds);
        $entityManager->persist(object: $menu);

        foreach ($menu->items as $item) {
            $entityManager->persist(object: $item);
            $this->removeNodes(
                menuItemId: $item->id,
                keptNodeIds: array_map(callback: static fn (MenuItemNode $node): string => $node->id, array: $item->nodes),
            );

            foreach ($item->nodes as $node) {
                $entityManager->persist(object: $node);
            }
        }
    }

    public function delete(Menu $menu): void
    {
        $this->removeOrphanNodes(menuId: $menu->id, keptItemIds: []);
        $this->removeChildren(menuId: $menu->id, keptItemIds: []);
        $this->getEntityManager()->remove(object: $menu);
    }

    /**
     * @return MenuItem[]
     */
    private function findItems(string $menuId): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('menuItem')
            ->from(from: MenuItem::class, alias: 'menuItem')
            ->where('menuItem.menuId = :menuId')
            ->setParameter(key: 'menuId', value: $menuId)
            ->orderBy(sort: 'menuItem.position', order: 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return MenuItemNode[]
     */
    private function findNodes(string $menuItemId): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('menuItemNode')
            ->from(from: MenuItemNode::class, alias: 'menuItemNode')
            ->where('menuItemNode.menuItemId = :menuItemId')
            ->setParameter(key: 'menuItemId', value: $menuItemId)
            ->orderBy(sort: 'menuItemNode.depth', order: 'ASC')
            ->addOrderBy(sort: 'menuItemNode.path', order: 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @param array<int, string> $keptItemIds
     */
    private function removeChildren(string $menuId, array $keptItemIds): void
    {
        $queryBuilder = $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: MenuItem::class, alias: 'menuItem')
            ->where('menuItem.menuId = :menuId')
            ->setParameter(key: 'menuId', value: $menuId);

        if ([] !== $keptItemIds) {
            $queryBuilder->andWhere('menuItem.id NOT IN (:keptItemIds)')
                ->setParameter(key: 'keptItemIds', value: $keptItemIds);
        }

        $queryBuilder->getQuery()->execute();
    }

    /**
     * The breakdown of an item that no longer belongs to the menu has nothing left to hang from.
     *
     * @param array<int, string> $keptItemIds
     */
    private function removeOrphanNodes(string $menuId, array $keptItemIds): void
    {
        $droppedItemIds = $this->getEntityManager()->createQueryBuilder()
            ->select('menuItem.id')
            ->from(from: MenuItem::class, alias: 'menuItem')
            ->where('menuItem.menuId = :menuId')
            ->setParameter(key: 'menuId', value: $menuId);

        if ([] !== $keptItemIds) {
            $droppedItemIds->andWhere('menuItem.id NOT IN (:keptItemIds)')
                ->setParameter(key: 'keptItemIds', value: $keptItemIds);
        }

        $itemIds = array_column(array: $droppedItemIds->getQuery()->getArrayResult(), column_key: 'id');
        if ([] === $itemIds) {
            return;
        }

        $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: MenuItemNode::class, alias: 'menuItemNode')
            ->where('menuItemNode.menuItemId IN (:menuItemIds)')
            ->setParameter(key: 'menuItemIds', value: $itemIds)
            ->getQuery()
            ->execute();
    }

    /**
     * @param array<int, string> $keptNodeIds
     */
    private function removeNodes(string $menuItemId, array $keptNodeIds): void
    {
        $queryBuilder = $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: MenuItemNode::class, alias: 'menuItemNode')
            ->where('menuItemNode.menuItemId = :menuItemId')
            ->setParameter(key: 'menuItemId', value: $menuItemId);

        if ([] !== $keptNodeIds) {
            $queryBuilder->andWhere('menuItemNode.id NOT IN (:keptNodeIds)')
                ->setParameter(key: 'keptNodeIds', value: $keptNodeIds);
        }

        $queryBuilder->getQuery()->execute();
    }
}
