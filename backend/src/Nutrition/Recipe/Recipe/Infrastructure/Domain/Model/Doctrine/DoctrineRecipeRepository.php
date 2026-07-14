<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Recipe\Recipe\Domain\Model\Recipe;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineRecipeRepository extends EntityRepository implements RecipeRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Recipe
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('recipe')
            ->from(from: Recipe::class, alias: 'recipe')
            ->where('recipe.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(Recipe $recipe): void
    {
        $entityManager = $this->getEntityManager();

        $this->removeChildren(recipeId: $recipe->id);
        $entityManager->persist(object: $recipe);

        foreach ($recipe->ingredients as $ingredient) {
            $entityManager->persist(object: $ingredient);
        }
    }

    public function delete(Recipe $recipe): void
    {
        $this->removeChildren(recipeId: $recipe->id);
        $this->getEntityManager()->remove(object: $recipe);
    }

    private function removeChildren(string $recipeId): void
    {
        $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: RecipeIngredient::class, alias: 'recipeIngredient')
            ->where('recipeIngredient.recipeId = :recipeId')
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->getQuery()
            ->execute();
    }
}
