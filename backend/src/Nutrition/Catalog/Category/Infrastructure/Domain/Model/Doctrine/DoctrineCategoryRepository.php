<?php

namespace Nutrition\Catalog\Category\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Catalog\Category\Domain\Model\Category;
use Nutrition\Catalog\Category\Domain\Model\CategoryRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineCategoryRepository extends EntityRepository implements CategoryRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByName(string $name): ?Category
    {
        return $this->findOneBy(['name' => $name]);
    }

    public function save(Category $category): void
    {
        $this->getEntityManager()->persist(object: $category);
    }
}
