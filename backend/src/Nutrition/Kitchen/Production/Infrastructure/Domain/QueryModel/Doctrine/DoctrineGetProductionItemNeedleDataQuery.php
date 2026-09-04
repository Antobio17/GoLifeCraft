<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItemConsumption;
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
    private const string FALLBACK_ARTICLE_EMOJI = '🍽️';

    private const string FALLBACK_RECIPE_EMOJI = '🍲';

    private const string DELETED_NAME = '(eliminado)';

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
                'i.code',
                'i.label',
                'i.customized',
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
        $composition = $this->compositionOf(itemId: $row['id']);
        $needs = [] === $composition ? $this->needsOf(row: $row) : null;

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
            code: $row['code'],
            label: (string) ($row['label'] ?? ''),
            customized: (bool) $row['customized'],
            checkedArticleIds: $this->decodeList(value: $row['checked_articles'] ?? null),
            checkedStepPositions: array_map(
                callback: static fn (mixed $position): int => (int) $position,
                array: $this->decodeList(value: $row['checked_steps'] ?? null),
            ),
            ingredients: null === $needs
                ? $this->storedIngredients(composition: $composition)
                : $this->ingredients(needs: $needs),
            subRecipes: null === $needs
                ? $this->storedSubRecipes(composition: $composition)
                : $this->subRecipes(needs: $needs),
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
    private function needsOf(array $row): ProductionNeeds
    {
        return $this->ingredientResolver->resolveDirect(
            recipeId: $row['recipe_id'],
            servings: $this->servingsToShow(row: $row),
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
     * @return array<int, array<string, mixed>>
     */
    private function compositionOf(string $itemId): array
    {
        return $this->connection->createQueryBuilder()
            ->select('c.kind', 'c.ref_id', 'c.quantity', 'c.unit', 'c.display_quantity', 'c.display_unit', 'c.source_production_item_id')
            ->from(table: 'production_item_consumption', alias: 'c')
            ->where('c.production_item_id = :itemId')
            ->setParameter(key: 'itemId', value: $itemId)
            ->orderBy('c.kind', 'DESC')
            ->addOrderBy('c.created_at', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();
    }

    /**
     * @param array<int, array<string, mixed>> $composition
     *
     * @return ProductionIngredientView[]
     */
    private function storedIngredients(array $composition): array
    {
        $lines = array_values(array: array_filter(
            array: $composition,
            callback: static fn (array $line): bool => ProductionItemConsumption::KIND_ARTICLE === $line['kind'],
        ));

        if ([] === $lines) {
            return [];
        }

        $articles = $this->articlesById(articleIds: array_column(array: $lines, column_key: 'ref_id'));

        return array_map(callback: static function (array $line) use ($articles): ProductionIngredientView {
            $display = (float) $line['display_quantity'];

            return new ProductionIngredientView(
                articleId: $line['ref_id'],
                name: $articles[$line['ref_id']]['name'] ?? self::DELETED_NAME,
                emoji: $articles[$line['ref_id']]['emoji'] ?? self::FALLBACK_ARTICLE_EMOJI,
                image: $articles[$line['ref_id']]['image'] ?? null,
                quantity: $display > 0.0 ? $display : (float) $line['quantity'],
                unit: (string) ($line['display_unit'] ?? $line['unit']),
            );
        }, array: $lines);
    }

    /**
     * @param array<int, array<string, mixed>> $composition
     *
     * @return ProductionSubRecipeView[]
     */
    private function storedSubRecipes(array $composition): array
    {
        $lines = array_values(array: array_filter(
            array: $composition,
            callback: static fn (array $line): bool => ProductionItemConsumption::KIND_RECIPE === $line['kind'],
        ));

        if ([] === $lines) {
            return [];
        }

        $recipeIds = array_column(array: $lines, column_key: 'ref_id');
        $recipes = $this->recipesById(recipeIds: $recipeIds);
        $stock = $this->stockByRecipe(recipeIds: $recipeIds);
        $lots = $this->lotsById(productionItemIds: array_column(array: $lines, column_key: 'source_production_item_id'));

        return array_map(callback: static fn (array $line): ProductionSubRecipeView => new ProductionSubRecipeView(
            recipeId: $line['ref_id'],
            name: $recipes[$line['ref_id']]['name'] ?? self::DELETED_NAME,
            emoji: $recipes[$line['ref_id']]['emoji'] ?? self::FALLBACK_RECIPE_EMOJI,
            image: $recipes[$line['ref_id']]['image'] ?? null,
            servings: (float) $line['quantity'],
            inStock: $stock[$line['ref_id']] ?? 0.0,
            sourceProductionItemId: $line['source_production_item_id'],
            lotCode: $lots[$line['source_production_item_id']]['code'] ?? null,
            lotLabel: (string) ($lots[$line['source_production_item_id']]['label'] ?? ''),
        ), array: $lines);
    }

    /**
     * @param string[] $articleIds
     *
     * @return array<string, array{name: string, emoji: string, image: ?string}>
     */
    private function articlesById(array $articleIds): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('a.id', 'a.name', 'a.emoji', 'a.image')
            ->from(table: 'article', alias: 'a')
            ->where('a.id IN (:articleIds)')
            ->setParameter(key: 'articleIds', value: $articleIds, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $articles = [];

        foreach ($rows as $row) {
            $articles[$row['id']] = ['name' => (string) $row['name'], 'emoji' => (string) $row['emoji'], 'image' => $row['image']];
        }

        return $articles;
    }

    /**
     * @param array<int, ?string> $productionItemIds
     *
     * @return array<string, array{code: ?string, label: string}>
     */
    private function lotsById(array $productionItemIds): array
    {
        $ids = array_values(array: array_unique(array: array_filter(array: $productionItemIds)));

        if ([] === $ids) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('i.id', 'i.code', 'i.label')
            ->from(table: 'production_item', alias: 'i')
            ->where('i.id IN (:productionItemIds)')
            ->setParameter(key: 'productionItemIds', value: $ids, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $lots = [];

        foreach ($rows as $row) {
            $lots[$row['id']] = ['code' => $row['code'], 'label' => (string) ($row['label'] ?? '')];
        }

        return $lots;
    }

    /**
     * @param string[] $recipeIds
     *
     * @return array<string, array{name: string, emoji: string, image: ?string}>
     */
    private function recipesById(array $recipeIds): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('r.id', 'r.name', 'r.emoji', 'r.image')
            ->from(table: 'recipe', alias: 'r')
            ->where('r.id IN (:recipeIds)')
            ->setParameter(key: 'recipeIds', value: $recipeIds, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $recipes = [];

        foreach ($rows as $row) {
            $recipes[$row['id']] = ['name' => (string) $row['name'], 'emoji' => (string) $row['emoji'], 'image' => $row['image']];
        }

        return $recipes;
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
                image: $ingredient->image,
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
                image: $subRecipe->image,
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
