<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleCategoryResult;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleNutritionFactsResult;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleResult;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleSupermarketResult;
use Nutrition\Catalog\Article\Domain\QueryModel\GetArticleNeedleDataQuery;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryRelationshipResult;

final readonly class DoctrineGetArticleNeedleDataQuery implements GetArticleNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findArticleById(string $articleId): ?GetArticleResult
    {
        $result = $this->connection->createQueryBuilder()
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
            ->leftJoin(fromAlias: 't', join: 'nutrition_facts', alias: 'nf', condition: 't.nutrition_facts_id = nf.id')
            ->where('t.id = :id')
            ->setParameter(key: 'id', value: $articleId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $result) {
            return null;
        }

        $utc = new \DateTimeZone(timezone: 'UTC');

        $article = new GetArticleResult(
            id: $result['id'],
            aggregateName: 'Article',
            name: $result['name'],
            recipeUnit: $result['recipe_unit'],
            price: null !== $result['price'] ? (float) $result['price'] : null,
            brand: $result['brand'],
            emoji: $result['emoji'],
            supermarketId: $result['supermarket_id'],
            categoryId: $result['category_id'],
            nutritionFactsId: $result['nutrition_facts_id'],
            createdAt: new \DateTime(datetime: $result['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $result['updated_at'], timezone: $utc),
            createdByUserId: $result['created_by_user_id'],
            updatedByUserId: $result['updated_by_user_id'],
        );

        $article->relationships = $this->buildRelationships(row: $result);

        return $article;
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
