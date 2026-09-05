<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationResult;
use Nutrition\Pantry\Location\Domain\QueryModel\GetLocationNeedleDataQuery;

final readonly class DoctrineGetLocationNeedleDataQuery implements GetLocationNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findLocationById(string $locationId): ?GetLocationResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
                'l.id',
                'l.name',
                'l.emoji',
                'l.description',
                'l.created_at',
                'l.updated_at',
                'l.created_by_user_id',
                'l.updated_by_user_id',
                '(SELECT COUNT(*) FROM article_stock s WHERE s.location_id = l.id) AS article_count',
                '(SELECT COUNT(*) FROM recipe_stock r WHERE r.location_id = l.id) AS recipe_count',
            )
            ->from(table: 'pantry_location', alias: 'l')
            ->where('l.id = :locationId')
            ->setParameter(key: 'locationId', value: $locationId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetLocationResult(
            id: $row['id'],
            aggregateName: 'PantryLocation',
            name: $row['name'],
            emoji: (string) ($row['emoji'] ?? ''),
            description: (string) ($row['description'] ?? ''),
            articleCount: (int) $row['article_count'],
            recipeCount: (int) $row['recipe_count'],
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }
}
