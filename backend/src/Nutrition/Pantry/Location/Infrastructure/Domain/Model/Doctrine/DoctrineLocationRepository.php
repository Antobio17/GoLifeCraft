<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Domain\Model\LocationItem;
use Nutrition\Pantry\Location\Domain\Model\LocationRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineLocationRepository extends EntityRepository implements LocationRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Location
    {
        $location = $this->find($id);

        if (null === $location) {
            return null;
        }

        $location->items = $this->itemsOf(locationId: $id);

        return $location;
    }

    public function save(Location $location): void
    {
        $entityManager = $this->getEntityManager();

        $entityManager->persist(object: $location);

        foreach ($location->items as $item) {
            $entityManager->persist(object: $item);
        }

        $this->releaseItems(location: $location);
    }

    public function delete(Location $location): void
    {
        $entityManager = $this->getEntityManager();

        foreach ($location->items as $item) {
            $entityManager->remove(object: $item);
        }

        $entityManager->remove(object: $location);
    }

    /**
     * @return LocationItem[]
     */
    private function itemsOf(string $locationId): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('item')
            ->from(from: LocationItem::class, alias: 'item')
            ->where('item.locationId = :locationId')
            ->setParameter(key: 'locationId', value: $locationId)
            ->getQuery()
            ->getResult();
    }

    private function releaseItems(Location $location): void
    {
        $keptIds = array_map(
            callback: static fn (LocationItem $item): string => $item->id,
            array: $location->items,
        );

        $query = $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: LocationItem::class, alias: 'item')
            ->where('item.locationId = :locationId')
            ->setParameter(key: 'locationId', value: $location->id);

        if ([] !== $keptIds) {
            $query->andWhere('item.id NOT IN (:keptIds)')->setParameter(key: 'keptIds', value: $keptIds);
        }

        $query->getQuery()->execute();
    }
}
