<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionResult;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredientView;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionStepView;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetProductionNeedleDataQuery;

final readonly class DoctrineGetProductionNeedleDataQuery implements GetProductionNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineProductionIngredientResolver $ingredientResolver,
    ) {
    }

    public function findProductionById(string $productionId): ?GetProductionResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
                'p.id',
                'p.recipe_id',
                'p.cook_date',
                'p.status',
                'p.servings_cooked',
                'p.name_snapshot',
                'p.emoji_snapshot',
                'p.created_at',
                'p.updated_at',
                'p.created_by_user_id',
                'p.updated_by_user_id',
                'r.servings AS recipe_servings'
            )
            ->from(table: 'production', alias: 'p')
            ->leftJoin(fromAlias: 'p', join: 'recipe', alias: 'r', condition: 'r.id = p.recipe_id')
            ->where('p.id = :productionId')
            ->setParameter(key: 'productionId', value: $productionId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $utc = new \DateTimeZone(timezone: 'UTC');
        $servingsCooked = (float) $row['servings_cooked'];

        return new GetProductionResult(
            id: $row['id'],
            aggregateName: 'Production',
            recipeId: $row['recipe_id'],
            name: $row['name_snapshot'],
            emoji: $row['emoji_snapshot'],
            cookDate: $row['cook_date'],
            status: $row['status'],
            servingsCooked: $servingsCooked,
            recipeServings: max(1, (int) ($row['recipe_servings'] ?? 1)),
            ingredients: $this->ingredients(recipeId: $row['recipe_id'], servings: $servingsCooked),
            steps: $this->steps(recipeId: $row['recipe_id']),
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }

    /**
     * @return ProductionIngredientView[]
     */
    private function ingredients(string $recipeId, float $servings): array
    {
        return array_map(
            callback: static fn (ProductionIngredient $ingredient): ProductionIngredientView => new ProductionIngredientView(
                articleId: $ingredient->articleId,
                name: $ingredient->name,
                emoji: $ingredient->emoji,
                quantity: $ingredient->quantity,
                unit: $ingredient->unit,
            ),
            array: $this->ingredientResolver->resolve(recipeId: $recipeId, servings: $servings),
        );
    }

    /**
     * @return ProductionStepView[]
     */
    private function steps(string $recipeId): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('rs.position', 'rs.text', 'rs.minutes')
            ->from(table: 'recipe_step', alias: 'rs')
            ->where('rs.recipe_id = :recipeId')
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->orderBy('rs.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(callback: static fn (array $row): ProductionStepView => new ProductionStepView(
            position: (int) $row['position'],
            text: (string) $row['text'],
            minutes: null !== $row['minutes'] ? (int) $row['minutes'] : null,
        ), array: $rows);
    }
}
