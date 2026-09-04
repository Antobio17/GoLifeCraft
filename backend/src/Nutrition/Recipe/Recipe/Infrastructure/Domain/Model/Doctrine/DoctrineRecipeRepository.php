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
        $recipe = $this->getEntityManager()->createQueryBuilder()
            ->select('recipe')
            ->from(from: Recipe::class, alias: 'recipe')
            ->where('recipe.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();

        if (null === $recipe) {
            return null;
        }

        $recipe->ingredients = $this->findChildrenOf(entityClass: RecipeIngredient::class, recipeId: $recipe->id);
        $recipe->steps = $this->findChildrenOf(entityClass: RecipeStep::class, recipeId: $recipe->id);

        return $recipe;
    }

    /**
     * Reconciles the children by id: a command that does not rebuild them keeps the ones it loaded,
     * so wiping them all would drop the ingredients and the steps of every caller that only touches the recipe itself.
     */
    public function save(Recipe $recipe): void
    {
        $entityManager = $this->getEntityManager();

        $this->removeChildren(
            recipeId: $recipe->id,
            keptIngredientIds: array_map(
                callback: static fn (RecipeIngredient $ingredient): string => $ingredient->id,
                array: $recipe->ingredients,
            ),
            keptStepIds: array_map(
                callback: static fn (RecipeStep $step): string => $step->id,
                array: $recipe->steps,
            ),
        );
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
        $this->removeChildren(recipeId: $recipe->id, keptIngredientIds: [], keptStepIds: []);
        $this->getEntityManager()->remove(object: $recipe);
    }

    /**
     * @param class-string $entityClass
     *
     * @return object[]
     */
    private function findChildrenOf(string $entityClass, string $recipeId): array
    {
        return $this->getEntityManager()->getRepository(className: $entityClass)
            ->findBy(criteria: ['recipeId' => $recipeId], orderBy: ['position' => 'ASC']);
    }

    /**
     * @param array<int, string> $keptIngredientIds
     * @param array<int, string> $keptStepIds
     */
    private function removeChildren(string $recipeId, array $keptIngredientIds, array $keptStepIds): void
    {
        $this->removeChildrenOf(
            entityClass: RecipeIngredient::class,
            alias: 'recipeIngredient',
            recipeId: $recipeId,
            keptIds: $keptIngredientIds,
        );
        $this->removeChildrenOf(
            entityClass: RecipeStep::class,
            alias: 'recipeStep',
            recipeId: $recipeId,
            keptIds: $keptStepIds,
        );
    }

    /**
     * @param array<int, string> $keptIds
     */
    private function removeChildrenOf(string $entityClass, string $alias, string $recipeId, array $keptIds): void
    {
        $queryBuilder = $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: $entityClass, alias: $alias)
            ->where($alias.'.recipeId = :recipeId')
            ->setParameter(key: 'recipeId', value: $recipeId);

        if ([] !== $keptIds) {
            $queryBuilder->andWhere($alias.'.id NOT IN (:keptIds)')
                ->setParameter(key: 'keptIds', value: $keptIds);
        }

        $queryBuilder->getQuery()->execute();
    }
}
