<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\GetRecipeResult;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeIngredientView;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;
use Nutrition\Recipe\Recipe\Domain\QueryModel\GetRecipeNeedleDataQuery;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeNutritionCalculator;

final readonly class DoctrineGetRecipeNeedleDataQuery implements GetRecipeNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private RecipeNutritionCalculator $calculator,
    ) {
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

        $graph = $this->graphProvider->load();
        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetRecipeResult(
            id: $row['id'],
            aggregateName: 'Recipe',
            name: $row['name'],
            emoji: $row['emoji'],
            category: $row['category'],
            servings: (int) $row['servings'],
            ingredients: $this->ingredients(recipeId: $recipeId, graph: $graph),
            total: $this->calculator->totalsFor(graph: $graph, recipeId: $recipeId)->rounded(),
            perServing: $this->calculator->perServingFor(graph: $graph, recipeId: $recipeId)->rounded(),
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }

    private function ingredients(string $recipeId, RecipeNutritionGraph $graph): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('ri.id', 'ri.kind', 'ri.ref_id', 'ri.quantity', 'ri.position')
            ->from(table: 'recipe_ingredient', alias: 'ri')
            ->where('ri.recipe_id = :recipeId')
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->orderBy('ri.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $calculator = $this->calculator;

        return array_map(callback: static function ($row) use ($graph, $calculator): RecipeIngredientView {
            $isSubRecipe = RecipeIngredient::KIND_RECIPE === $row['kind'];
            $quantity = (float) $row['quantity'];

            return new RecipeIngredientView(
                id: $row['id'],
                kind: $row['kind'],
                refId: $row['ref_id'],
                name: ($isSubRecipe ? $graph->recipeName(recipeId: $row['ref_id']) : $graph->articleName(articleId: $row['ref_id'])) ?? 'Desconocido',
                emoji: $isSubRecipe ? $graph->recipeEmoji(recipeId: $row['ref_id']) : $graph->articleEmoji(articleId: $row['ref_id']),
                quantity: $quantity,
                unit: $isSubRecipe ? 'ración' : 'g',
                position: (int) $row['position'],
                macros: $calculator->ingredientContribution(
                    graph: $graph,
                    kind: $row['kind'],
                    refId: $row['ref_id'],
                    quantity: $quantity,
                )->rounded(),
            );
        }, array: $rows);
    }
}
