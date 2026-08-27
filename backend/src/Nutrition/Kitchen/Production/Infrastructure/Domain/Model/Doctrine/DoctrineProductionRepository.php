<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineProductionRepository extends EntityRepository implements ProductionRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Production
    {
        return $this->find($id);
    }

    public function save(Production $production): void
    {
        $this->getEntityManager()->persist(object: $production);
    }

    public function delete(Production $production): void
    {
        $this->getEntityManager()->remove(object: $production);
    }
}
