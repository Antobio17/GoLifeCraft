<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLine;
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

        $inventory->lines = $this->linesOf(inventoryId: $id);

        return $inventory;
    }

    public function save(Inventory $inventory): void
    {
        $entityManager = $this->getEntityManager();

        $entityManager->persist(object: $inventory);

        foreach ($inventory->lines as $line) {
            $entityManager->persist(object: $line);
        }
    }

    public function delete(Inventory $inventory): void
    {
        $entityManager = $this->getEntityManager();

        foreach ($inventory->lines as $line) {
            $entityManager->remove(object: $line);
        }

        $entityManager->remove(object: $inventory);
    }

    /**
     * @return InventoryLine[]
     */
    private function linesOf(string $inventoryId): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('line')
            ->from(from: InventoryLine::class, alias: 'line')
            ->where('line.inventoryId = :inventoryId')
            ->orderBy('line.position', 'ASC')
            ->setParameter(key: 'inventoryId', value: $inventoryId)
            ->getQuery()
            ->getResult();
    }
}
