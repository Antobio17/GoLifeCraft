<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionItemResult;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredientView;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionNeeds;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionStepView;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionSubRecipe;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionSubRecipeView;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetProductionItemNeedleDataQuery;

final readonly class DoctrineGetProductionItemNeedleDataQuery implements GetProductionItemNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineProductionIngredientResolver $ingredientResolver,
    ) {
    }

    public function findItemById(string $productionId, string $itemId): ?GetProductionItemResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
                'i.id',
                'i.production_id',
                'i.recipe_id',
                'i.status',
                'i.servings_planned',
                'i.servings_cooked',
                'i.name_snapshot',
                'i.emoji_snapshot',
                'i.checked_articles',
                'i.checked_steps',
                'i.created_at',
                'i.updated_at',
                'i.created_by_user_id',
                'i.updated_by_user_id',
                'r.servings AS recipe_servings',
                'p.status AS production_status'
            )
            ->from(table: 'production_item', alias: 'i')
            ->leftJoin(fromAlias: 'i', join: 'recipe', alias: 'r', condition: 'r.id = i.recipe_id')
            ->innerJoin(fromAlias: 'i', join: 'production', alias: 'p', condition: 'p.id = i.production_id')
            ->where('i.id = :itemId')
            ->andWhere('i.production_id = :productionId')
            ->setParameter(key: 'itemId', value: $itemId)
            ->setParameter(key: 'productionId', value: $productionId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $utc = new \DateTimeZone(timezone: 'UTC');
        $needs = $this->ingredientResolver->resolveDirect(
            recipeId: $row['recipe_id'],
            servings: $this->servingsToShow(row: $row),
        );

        return new GetProductionItemResult(
            id: $row['id'],
            aggregateName: 'ProductionItem',
            productionId: $row['production_id'],
            recipeId: $row['recipe_id'],
            name: $row['name_snapshot'],
            emoji: $row['emoji_snapshot'],
            status: $row['status'],
            productionStatus: $row['production_status'],
            servingsPlanned: (float) $row['servings_planned'],
            servingsCooked: (float) $row['servings_cooked'],
            recipeServings: max(1, (int) ($row['recipe_servings'] ?? 1)),
            checkedArticleIds: $this->decodeList(value: $row['checked_articles'] ?? null),
            checkedStepPositions: array_map(
                callback: static fn (mixed $position): int => (int) $position,
                array: $this->decodeList(value: $row['checked_steps'] ?? null),
            ),
            ingredients: $this->ingredients(needs: $needs),
            subRecipes: $this->subRecipes(needs: $needs),
            steps: $this->steps(recipeId: $row['recipe_id']),
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }

    /**
     * @param array<string, mixed> $row
     */
    private function servingsToShow(array $row): float
    {
        if (ProductionItem::STATUS_DONE === $row['status']) {
            return (float) $row['servings_cooked'];
        }

        return (float) $row['servings_planned'];
    }

    /**
     * @return array<int, mixed>
     */
    private function decodeList(mixed $value): array
    {
        $decoded = json_decode(json: (string) ($value ?? '[]'), associative: true);

        return is_array(value: $decoded) ? array_values(array: $decoded) : [];
    }

    /**
     * @return ProductionIngredientView[]
     */
    private function ingredients(ProductionNeeds $needs): array
    {
        return array_map(
            callback: static fn (ProductionIngredient $ingredient): ProductionIngredientView => new ProductionIngredientView(
                articleId: $ingredient->articleId,
                name: $ingredient->name,
                emoji: $ingredient->emoji,
                quantity: $ingredient->quantity,
                unit: $ingredient->unit,
            ),
            array: $needs->articles,
        );
    }

    /**
     * @return ProductionSubRecipeView[]
     */
    private function subRecipes(ProductionNeeds $needs): array
    {
        if ([] === $needs->subRecipes) {
            return [];
        }

        $stock = $this->stockByRecipe(recipeIds: array_map(
            callback: static fn (ProductionSubRecipe $subRecipe): string => $subRecipe->recipeId,
            array: $needs->subRecipes,
        ));

        return array_map(
            callback: static fn (ProductionSubRecipe $subRecipe): ProductionSubRecipeView => new ProductionSubRecipeView(
                recipeId: $subRecipe->recipeId,
                name: $subRecipe->name,
                emoji: $subRecipe->emoji,
                servings: $subRecipe->servings,
                inStock: $stock[$subRecipe->recipeId] ?? 0.0,
            ),
            array: $needs->subRecipes,
        );
    }

    /**
     * @param string[] $recipeIds
     *
     * @return array<string, float>
     */
    private function stockByRecipe(array $recipeIds): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('s.recipe_id', 's.servings')
            ->from(table: 'recipe_stock', alias: 's')
            ->where('s.recipe_id IN (:recipeIds)')
            ->setParameter(key: 'recipeIds', value: $recipeIds, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $stock = [];

        foreach ($rows as $row) {
            $stock[$row['recipe_id']] = (float) $row['servings'];
        }

        return $stock;
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
