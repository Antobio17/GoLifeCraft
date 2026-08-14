<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticleResult;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\GetGlobalArticleNeedleDataQuery;

final readonly class DoctrineGetGlobalArticleNeedleDataQuery implements GetGlobalArticleNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findGlobalArticleById(string $globalArticleId): ?GetGlobalArticleResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
                't.id',
                't.barcode',
                't.name',
                't.brand',
                't.category_name',
                't.image_url',
                't.quantity',
                't.stores',
                't.price',
                't.bulk_price',
                't.reference_price',
                't.reference_format',
                't.previous_price',
                't.source',
                't.reference_amount',
                't.calories',
                't.protein',
                't.carbs',
                't.sugars',
                't.fat',
                't.saturated_fat',
                't.fiber',
                't.salt',
                't.created_at',
                't.updated_at',
                't.created_by_user_id',
                't.updated_by_user_id',
            )
            ->from(table: 'global_article', alias: 't')
            ->where('t.id = :id')
            ->setParameter(key: 'id', value: $globalArticleId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetGlobalArticleResult(
            id: $row['id'],
            aggregateName: 'GlobalArticle',
            barcode: $row['barcode'],
            name: $row['name'],
            brand: $row['brand'],
            categoryName: $row['category_name'],
            imageUrl: $row['image_url'],
            quantity: $row['quantity'],
            stores: $row['stores'],
            price: null !== $row['price'] ? (float) $row['price'] : null,
            bulkPrice: null !== $row['bulk_price'] ? (float) $row['bulk_price'] : null,
            referencePrice: null !== $row['reference_price'] ? (float) $row['reference_price'] : null,
            referenceFormat: $row['reference_format'],
            previousPrice: null !== $row['previous_price'] ? (float) $row['previous_price'] : null,
            source: $row['source'],
            referenceAmount: (float) $row['reference_amount'],
            calories: null !== $row['calories'] ? (float) $row['calories'] : null,
            protein: null !== $row['protein'] ? (float) $row['protein'] : null,
            carbs: null !== $row['carbs'] ? (float) $row['carbs'] : null,
            sugars: null !== $row['sugars'] ? (float) $row['sugars'] : null,
            fat: null !== $row['fat'] ? (float) $row['fat'] : null,
            saturatedFat: null !== $row['saturated_fat'] ? (float) $row['saturated_fat'] : null,
            fiber: null !== $row['fiber'] ? (float) $row['fiber'] : null,
            salt: null !== $row['salt'] ? (float) $row['salt'] : null,
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }
}
