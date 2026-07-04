<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleResult;
use Nutrition\Catalog\Article\Domain\QueryModel\GetArticleNeedleDataQuery;

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
                't.supermarket_id',
                't.category_id',
                't.nutrition_facts_id',
                't.created_at',
                't.updated_at',
                't.created_by_user_id',
                't.updated_by_user_id',
            )
            ->from(table: 'article', alias: 't')
            ->where('t.id = :id')
            ->setParameter(key: 'id', value: $articleId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $result) {
            return null;
        }

        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetArticleResult(
            id: $result['id'],
            aggregateName: 'Article',
            name: $result['name'],
            recipeUnit: $result['recipe_unit'],
            supermarketId: $result['supermarket_id'],
            categoryId: $result['category_id'],
            nutritionFactsId: $result['nutrition_facts_id'],
            createdAt: new \DateTime(datetime: $result['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $result['updated_at'], timezone: $utc),
            createdByUserId: $result['created_by_user_id'],
            updatedByUserId: $result['updated_by_user_id'],
        );
    }
}
