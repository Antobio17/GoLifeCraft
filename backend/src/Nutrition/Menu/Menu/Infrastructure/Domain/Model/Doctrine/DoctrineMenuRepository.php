<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuItem;
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

        return $menu;
    }

    public function save(Menu $menu): void
    {
        $entityManager = $this->getEntityManager();

        $this->removeChildren(
            menuId: $menu->id,
            keptItemIds: array_map(callback: static fn (MenuItem $item): string => $item->id, array: $menu->items),
        );
        $entityManager->persist(object: $menu);

        foreach ($menu->items as $item) {
            $entityManager->persist(object: $item);
        }
    }

    public function delete(Menu $menu): void
    {
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
}
