<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\GetRecipeResult;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeIngredientView;
use Nutrition\Recipe\Recipe\Domain\QueryModel\GetRecipeNeedleDataQuery;

final readonly class DoctrineGetRecipeNeedleDataQuery implements GetRecipeNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findRecipeById(string $recipeId): ?GetRecipeResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
                'r.id',
                'r.name',
                'r.emoji',
                'r.category',
                'r.servings',
                'r.created_at',
                'r.updated_at',
                'r.created_by_user_id',
                'r.updated_by_user_id'
            )
            ->from(table: 'recipe', alias: 'r')
            ->where('r.id = :id')
            ->setParameter(key: 'id', value: $recipeId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $calculator = new RecipeNutritionCalculator(connection: $this->connection);
        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetRecipeResult(
            id: $row['id'],
            aggregateName: 'Recipe',
            name: $row['name'],
            emoji: $row['emoji'],
            category: $row['category'],
            servings: (int) $row['servings'],
            ingredients: $this->ingredients(recipeId: $recipeId, calculator: $calculator),
            total: $calculator->totalsFor(recipeId: $recipeId)->rounded(),
            perServing: $calculator->perServingFor(recipeId: $recipeId)->rounded(),
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }

    private function ingredients(string $recipeId, RecipeNutritionCalculator $calculator): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('ri.id', 'ri.kind', 'ri.ref_id', 'ri.quantity', 'ri.position')
            ->from(table: 'recipe_ingredient', alias: 'ri')
            ->where('ri.recipe_id = :recipeId')
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->orderBy('ri.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(callback: static function ($row) use ($calculator): RecipeIngredientView {
            $isSubRecipe = RecipeIngredient::KIND_RECIPE === $row['kind'];
            $quantity = (float) $row['quantity'];

            return new RecipeIngredientView(
                id: $row['id'],
                kind: $row['kind'],
                refId: $row['ref_id'],
                name: ($isSubRecipe ? $calculator->recipeName(recipeId: $row['ref_id']) : $calculator->articleName(articleId: $row['ref_id'])) ?? 'Desconocido',
                emoji: $isSubRecipe ? $calculator->recipeEmoji(recipeId: $row['ref_id']) : $calculator->articleEmoji(articleId: $row['ref_id']),
                quantity: $quantity,
                unit: $isSubRecipe ? 'ración' : 'g',
                position: (int) $row['position'],
                macros: $calculator->ingredientContribution(
                    kind: $row['kind'],
                    refId: $row['ref_id'],
                    quantity: $quantity,
                )->rounded(),
            );
        }, array: $rows);
    }
}
