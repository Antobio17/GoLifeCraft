<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\GetRecipesResult;
use Nutrition\Recipe\Recipe\Domain\QueryModel\GetRecipesNeedleDataQuery;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeNutritionCalculator;

final readonly class DoctrineGetRecipesNeedleDataQuery implements GetRecipesNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private RecipeNutritionCalculator $calculator,
    ) {
    }

    public function findRecipes(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $filterCategory = null,
        ?string $orderBy = null,
    ): array {
        $qb = $this->getBaseQuery(filterName: $filterName, filterCategory: $filterCategory)->select(
            'r.id',
            'r.name',
            'r.emoji',
            'r.category',
            'r.servings',
            'r.created_at',
            'r.updated_at',
            'r.created_by_user_id',
            'r.updated_by_user_id'
        );

        $this->applyOrdering(qb: $qb, orderBy: $orderBy);

        $rows = $qb->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        if ([] === $rows) {
            return [];
        }

        $ingredientSummary = $this->ingredientSummary(
            recipeIds: array_column(array: $rows, column_key: 'id'),
        );
        $graph = $this->graphProvider->load();
        $calculator = $this->calculator;
        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: function ($row) use ($ingredientSummary, $graph, $calculator, $utc): GetRecipesResult {
            $summary = $ingredientSummary[$row['id']] ?? ['count' => 0, 'hasSubRecipe' => false];

            return new GetRecipesResult(
                id: $row['id'],
                aggregateName: 'Recipe',
                name: $row['name'],
                emoji: $row['emoji'],
                category: $row['category'],
                servings: (int) $row['servings'],
                ingredientCount: $summary['count'],
                hasSubRecipe: $summary['hasSubRecipe'],
                total: $calculator->totalsFor(graph: $graph, recipeId: $row['id'])->rounded(),
                perServing: $calculator->perServingFor(graph: $graph, recipeId: $row['id'])->rounded(),
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            );
        }, array: $rows);
    }

    public function totalRecipes(?string $filterName = null, ?string $filterCategory = null): int
    {
        return (int) $this->getBaseQuery(filterName: $filterName, filterCategory: $filterCategory)
            ->select('COUNT(*)')
            ->executeQuery()
            ->fetchOne();
    }

    private function ingredientSummary(array $recipeIds): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('ri.recipe_id', 'ri.kind')
            ->from(table: 'recipe_ingredient', alias: 'ri')
            ->where('ri.recipe_id IN (:recipeIds)')
            ->setParameter(
                key: 'recipeIds',
                value: $recipeIds,
                type: ArrayParameterType::STRING,
            )
            ->executeQuery()
            ->fetchAllAssociative();

        $summaries = [];

        foreach ($rows as $row) {
            $recipeId = $row['recipe_id'];
            $summaries[$recipeId] ??= ['count' => 0, 'hasSubRecipe' => false];
            ++$summaries[$recipeId]['count'];

            if (RecipeIngredient::KIND_RECIPE === $row['kind']) {
                $summaries[$recipeId]['hasSubRecipe'] = true;
            }
        }

        return $summaries;
    }

    private function getBaseQuery(?string $filterName, ?string $filterCategory): QueryBuilder
    {
        $qb = $this->connection->createQueryBuilder()->from(table: 'recipe', alias: 'r');

        if (null !== $filterName) {
            $qb->andWhere('(r.name LIKE :name OR r.category LIKE :name)')
                ->setParameter(key: 'name', value: '%'.$filterName.'%');
        }

        if (null !== $filterCategory) {
            $qb->andWhere('r.category = :category')
                ->setParameter(key: 'category', value: $filterCategory);
        }

        return $qb;
    }

    private function applyOrdering(QueryBuilder $qb, ?string $orderBy): void
    {
        $allowedFields = [
            'name' => 'r.name',
            'category' => 'r.category',
            'createdAt' => 'r.created_at',
            'updatedAt' => 'r.updated_at',
        ];

        if (null === $orderBy) {
            $qb->orderBy(sort: 'r.name', order: 'ASC');

            return;
        }

        $direction = 'ASC';
        $field = $orderBy;

        if (str_starts_with(haystack: $orderBy, needle: '-')) {
            $direction = 'DESC';
            $field = substr(string: $orderBy, offset: 1);
        }

        if (!isset($allowedFields[$field])) {
            $qb->orderBy(sort: 'r.name', order: 'ASC');

            return;
        }

        $qb->orderBy(sort: $allowedFields[$field], order: $direction);
    }
}
