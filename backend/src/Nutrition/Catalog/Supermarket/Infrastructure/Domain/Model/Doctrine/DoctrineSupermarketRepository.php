<?php

namespace Nutrition\Catalog\Supermarket\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Catalog\Supermarket\Domain\Model\Supermarket;
use Nutrition\Catalog\Supermarket\Domain\Model\SupermarketRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineSupermarketRepository extends EntityRepository implements SupermarketRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByName(string $name): ?Supermarket
    {
        return $this->findOneBy(['name' => $name]);
    }

    public function save(Supermarket $supermarket): void
    {
        $this->getEntityManager()->persist(object: $supermarket);
    }
}
