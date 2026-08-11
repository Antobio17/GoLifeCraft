<?php

namespace Nutrition\Catalog\Supermarket\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Catalog\Supermarket\Domain\Model\Supermarket;
use Nutrition\Catalog\Supermarket\Domain\Model\SupermarketAisle;
use Nutrition\Catalog\Supermarket\Domain\Model\SupermarketRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineSupermarketRepository extends EntityRepository implements SupermarketRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Supermarket
    {
        $supermarket = $this->getEntityManager()->find(className: Supermarket::class, id: $id);
        if (null === $supermarket) {
            return null;
        }

        $supermarket->aisles = $this->findAisles(supermarketId: $supermarket->id);

        return $supermarket;
    }

    public function findByName(string $name): ?Supermarket
    {
        return $this->findOneBy(['name' => $name]);
    }

    public function save(Supermarket $supermarket): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist(object: $supermarket);

        $this->removeMissingAisles(supermarket: $supermarket);

        foreach ($supermarket->aisles as $aisle) {
            $entityManager->persist(object: $aisle);
        }
    }

    /**
     * @return SupermarketAisle[]
     */
    private function findAisles(string $supermarketId): array
    {
        return $this->getEntityManager()->getRepository(className: SupermarketAisle::class)
            ->findBy(criteria: ['supermarketId' => $supermarketId], orderBy: ['position' => 'ASC']);
    }

    private function removeMissingAisles(Supermarket $supermarket): void
    {
        $keptIds = array_map(
            callback: static fn (SupermarketAisle $aisle): string => $aisle->id,
            array: $supermarket->aisles,
        );

        $queryBuilder = $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: SupermarketAisle::class, alias: 'aisle')
            ->where('aisle.supermarketId = :supermarketId')
            ->setParameter(key: 'supermarketId', value: $supermarket->id);

        if ([] !== $keptIds) {
            $queryBuilder->andWhere('aisle.id NOT IN (:keptIds)')
                ->setParameter(key: 'keptIds', value: $keptIds);
        }

        $queryBuilder->getQuery()->execute();
    }
}
