<?php

namespace Nutrition\Pantry\RecipeStock\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStock;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStockRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineRecipeStockRepository extends EntityRepository implements RecipeStockRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByRecipeId(string $recipeId): ?RecipeStock
    {
        return $this->findOneBy(['recipeId' => $recipeId]);
    }

    public function save(RecipeStock $recipeStock): void
    {
        $this->getEntityManager()->persist(object: $recipeStock);
    }

    public function delete(RecipeStock $recipeStock): void
    {
        $this->getEntityManager()->remove(object: $recipeStock);
    }
}
