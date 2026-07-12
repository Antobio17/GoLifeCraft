<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleCategoryResult;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleNutritionFactsResult;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticlesResult;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleSupermarketResult;
use Nutrition\Catalog\Article\Domain\QueryModel\GetArticlesNeedleDataQuery;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryRelationshipResult;

final readonly class DoctrineGetArticlesNeedleDataQuery implements GetArticlesNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findArticles(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $orderBy = null,
    ): array {
        $qb = $this->getBaseQuery(filterName: $filterName);

        if (null !== $orderBy) {
            $this->applyOrdering(qb: $qb, orderBy: $orderBy);
        }

        $result = $qb->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: function ($row) use ($utc): GetArticlesResult {
            $article = new GetArticlesResult(
                id: $row['id'],
                aggregateName: 'Article',
                name: $row['name'],
                recipeUnit: $row['recipe_unit'],
                price: null !== $row['price'] ? (float) $row['price'] : null,
                brand: $row['brand'],
                emoji: $row['emoji'],
                supermarketId: $row['supermarket_id'],
                categoryId: $row['category_id'],
                nutritionFactsId: $row['nutrition_facts_id'],
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            );

            $article->relationships = $this->buildRelationships(row: $row);

            return $article;
        }, array: $result);
    }

    public function totalArticles(
        ?string $filterName = null,
    ): int {
        $qb = $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'article', alias: 't');

        if (null !== $filterName) {
            $qb->andWhere('t.name LIKE :name')
                ->setParameter(key: 'name', value: '%'.$filterName.'%');
        }

        return (int) $qb->executeQuery()->fetchOne();
    }

    private function getBaseQuery(?string $filterName = null): QueryBuilder
    {
        $qb = $this->connection->createQueryBuilder()
            ->select(
                't.id',
                't.name',
                't.recipe_unit',
                't.price',
                't.brand',
                't.emoji',
                't.supermarket_id',
                't.category_id',
                't.nutrition_facts_id',
                't.created_at',
                't.updated_at',
                't.created_by_user_id',
                't.updated_by_user_id',
                'c.name AS category_name',
                's.name AS supermarket_name',
                'nf.reference_amount AS nf_reference_amount',
                'nf.calories AS nf_calories',
                'nf.protein AS nf_protein',
                'nf.carbs AS nf_carbs',
                'nf.sugars AS nf_sugars',
                'nf.fat AS nf_fat',
                'nf.saturated_fat AS nf_saturated_fat',
                'nf.fiber AS nf_fiber',
                'nf.salt AS nf_salt',
            )
            ->from(table: 'article', alias: 't')
            ->leftJoin(fromAlias: 't', join: 'category', alias: 'c', condition: 't.category_id = c.id')
            ->leftJoin(fromAlias: 't', join: 'supermarket', alias: 's', condition: 't.supermarket_id = s.id')
            ->leftJoin(fromAlias: 't', join: 'nutrition_facts', alias: 'nf', condition: 't.nutrition_facts_id = nf.id');

        if (null !== $filterName) {
            $qb->andWhere('t.name LIKE :name')
                ->setParameter(key: 'name', value: '%'.$filterName.'%');
        }

        return $qb;
    }

    private function applyOrdering(QueryBuilder $qb, string $orderBy): void
    {
        $direction = 'ASC';
        $field = $orderBy;

        if (str_starts_with(haystack: $orderBy, needle: '-')) {
            $direction = 'DESC';
            $field = substr(string: $orderBy, offset: 1);
        }

        $allowedFields = [
            'name' => 't.name',
            'price' => 't.price',
            'createdAt' => 't.created_at',
            'updatedAt' => 't.updated_at',
        ];

        if (!isset($allowedFields[$field])) {
            return;
        }

        $qb->orderBy(sort: $allowedFields[$field], order: $direction);
    }

    /**
     * @param array<string, mixed> $row
     *
     * @return QueryRelationshipResult[]
     */
    private function buildRelationships(array $row): array
    {
        $relationships = [];

        if (null !== $row['category_id']) {
            $relationships[] = new GetArticleCategoryResult(
                id: $row['category_id'],
                aggregateName: 'Category',
                relationshipName: 'category',
                name: $row['category_name'],
            );
        }

        if (null !== $row['supermarket_id']) {
            $relationships[] = new GetArticleSupermarketResult(
                id: $row['supermarket_id'],
                aggregateName: 'Supermarket',
                relationshipName: 'supermarket',
                name: $row['supermarket_name'],
            );
        }

        if (null !== $row['nutrition_facts_id']) {
            $relationships[] = new GetArticleNutritionFactsResult(
                id: $row['nutrition_facts_id'],
                aggregateName: 'NutritionFacts',
                relationshipName: 'nutritionFacts',
                referenceAmount: (float) $row['nf_reference_amount'],
                calories: null !== $row['nf_calories'] ? (float) $row['nf_calories'] : null,
                protein: null !== $row['nf_protein'] ? (float) $row['nf_protein'] : null,
                carbs: null !== $row['nf_carbs'] ? (float) $row['nf_carbs'] : null,
                sugars: null !== $row['nf_sugars'] ? (float) $row['nf_sugars'] : null,
                fat: null !== $row['nf_fat'] ? (float) $row['nf_fat'] : null,
                saturatedFat: null !== $row['nf_saturated_fat'] ? (float) $row['nf_saturated_fat'] : null,
                fiber: null !== $row['nf_fiber'] ? (float) $row['nf_fiber'] : null,
                salt: null !== $row['nf_salt'] ? (float) $row['nf_salt'] : null,
            );
        }

        return $relationships;
    }
}
