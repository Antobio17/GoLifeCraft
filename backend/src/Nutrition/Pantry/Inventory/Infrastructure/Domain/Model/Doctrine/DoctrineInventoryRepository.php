<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocation;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineInventoryRepository extends EntityRepository implements InventoryRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Inventory
    {
        $inventory = $this->find($id);

        if (null === $inventory) {
            return null;
        }

        $itemsByLocation = $this->itemsOf(inventoryId: $id);
        $locations = $this->locationsOf(inventoryId: $id);

        foreach ($locations as $location) {
            $location->items = $itemsByLocation[$location->id] ?? [];
        }

        $inventory->locations = $locations;

        return $inventory;
    }

    public function findByIdWithItem(string $id, string $itemId): ?Inventory
    {
        $inventory = $this->find($id);

        if (null === $inventory) {
            return null;
        }

        $inventory->locations = $this->locationHoldingItem(inventoryId: $id, itemId: $itemId);

        return $inventory;
    }

    public function save(Inventory $inventory): void
    {
        $entityManager = $this->getEntityManager();

        $entityManager->persist(object: $inventory);

        foreach ($inventory->locations as $location) {
            $entityManager->persist(object: $location);

            foreach ($location->items as $item) {
                $entityManager->persist(object: $item);
            }
        }
    }

    public function delete(Inventory $inventory): void
    {
        $entityManager = $this->getEntityManager();

        foreach ($inventory->locations as $location) {
            foreach ($location->items as $item) {
                $entityManager->remove(object: $item);
            }

            $entityManager->remove(object: $location);
        }

        $entityManager->remove(object: $inventory);
    }

    /**
     * @return InventoryLocation[]
     */
    private function locationHoldingItem(string $inventoryId, string $itemId): array
    {
        $item = $this->getEntityManager()->createQueryBuilder()
            ->select('item')
            ->from(from: InventoryLocationItem::class, alias: 'item')
            ->where('item.id = :itemId')
            ->andWhere('item.inventoryId = :inventoryId')
            ->setParameter(key: 'itemId', value: $itemId)
            ->setParameter(key: 'inventoryId', value: $inventoryId)
            ->getQuery()
            ->getOneOrNullResult();

        if (null === $item) {
            return [];
        }

        $location = $this->getEntityManager()->find(
            className: InventoryLocation::class,
            id: $item->inventoryLocationId,
        );

        if (null === $location) {
            return [];
        }

        $location->items = [$item];

        return [$location];
    }

    /**
     * @return InventoryLocation[]
     */
    private function locationsOf(string $inventoryId): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('location')
            ->from(from: InventoryLocation::class, alias: 'location')
            ->where('location.inventoryId = :inventoryId')
            ->orderBy('location.position', 'ASC')
            ->setParameter(key: 'inventoryId', value: $inventoryId)
            ->getQuery()
            ->getResult();
    }

    /**
     * @return array<string, InventoryLocationItem[]>
     */
    private function itemsOf(string $inventoryId): array
    {
        $items = $this->getEntityManager()->createQueryBuilder()
            ->select('item')
            ->from(from: InventoryLocationItem::class, alias: 'item')
            ->where('item.inventoryId = :inventoryId')
            ->orderBy('item.position', 'ASC')
            ->setParameter(key: 'inventoryId', value: $inventoryId)
            ->getQuery()
            ->getResult();

        $grouped = [];

        foreach ($items as $item) {
            $grouped[$item->inventoryLocationId][] = $item;
        }

        return $grouped;
    }
}
