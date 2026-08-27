<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Recipe\Recipe\Domain\Model\Recipe;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeRepository;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeStep;
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

        foreach ($recipe->steps as $step) {
            $entityManager->persist(object: $step);
        }
    }

    public function delete(Recipe $recipe): void
    {
        $this->removeChildren(recipeId: $recipe->id);
        $this->getEntityManager()->remove(object: $recipe);
    }

    private function removeChildren(string $recipeId): void
    {
        $this->removeChildrenOf(entityClass: RecipeIngredient::class, alias: 'recipeIngredient', recipeId: $recipeId);
        $this->removeChildrenOf(entityClass: RecipeStep::class, alias: 'recipeStep', recipeId: $recipeId);
    }

    private function removeChildrenOf(string $entityClass, string $alias, string $recipeId): void
    {
        $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: $entityClass, alias: $alias)
            ->where($alias.'.recipeId = :recipeId')
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->getQuery()
            ->execute();
    }
}
