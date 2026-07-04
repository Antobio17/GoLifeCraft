<?php

namespace Nutrition\Catalog\Category\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Category\Domain\QueryModel\Dto\GetCategoryResult;
use Nutrition\Catalog\Category\Domain\QueryModel\GetCategoryNeedleDataQuery;

final readonly class DoctrineGetCategoryNeedleDataQuery implements GetCategoryNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findCategoryById(string $categoryId): ?GetCategoryResult
    {
        $result = $this->connection->createQueryBuilder()
            ->select(
                't.id',
                't.name',
                't.created_at',
                't.updated_at',
                't.created_by_user_id',
                't.updated_by_user_id',
            )
            ->from(table: 'category', alias: 't')
            ->where('t.id = :id')
            ->setParameter(key: 'id', value: $categoryId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $result) {
            return null;
        }

        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetCategoryResult(
            id: $result['id'],
            aggregateName: 'Category',
            name: $result['name'],
            createdAt: new \DateTime(datetime: $result['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $result['updated_at'], timezone: $utc),
            createdByUserId: $result['created_by_user_id'],
            updatedByUserId: $result['updated_by_user_id'],
        );
    }
}
