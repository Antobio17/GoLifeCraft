<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Pantry\Location\Domain\Model\Location;
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
        return $this->find($id);
    }

    public function save(Location $location): void
    {
        $this->getEntityManager()->persist(object: $location);
    }

    public function delete(Location $location): void
    {
        $this->getEntityManager()->remove(object: $location);
    }
}
