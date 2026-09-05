<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationItemsResult;
use Nutrition\Pantry\Location\Domain\QueryModel\GetLocationItemsNeedleDataQuery;

final readonly class DoctrineGetLocationItemsNeedleDataQuery implements GetLocationItemsNeedleDataQuery
{
    private const string RECIPE_UNIT = 'serving';

    public function __construct(private Connection $connection)
    {
    }

    public function locationExists(string $locationId): bool
    {
        $result = $this->connection->createQueryBuilder()
            ->select('l.id')
            ->from(table: 'pantry_location', alias: 'l')
            ->where('l.id = :locationId')
            ->setParameter(key: 'locationId', value: $locationId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false !== $result;
    }

    public function findItems(string $locationId): array
    {
        return array_merge(
            $this->articleItems(locationId: $locationId),
            $this->recipeItems(locationId: $locationId),
        );
    }

    /**
     * @return GetLocationItemsResult[]
     */
    private function articleItems(string $locationId): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                's.id',
                's.article_id AS ref_id',
                's.quantity',
                'a.name',
                'a.emoji',
                'a.base_unit',
            )
            ->from(table: 'article_stock', alias: 's')
            ->innerJoin(fromAlias: 's', join: 'article', alias: 'a', condition: 'a.id = s.article_id')
            ->where('s.location_id = :locationId')
            ->orderBy(sort: 'a.name', order: 'ASC')
            ->setParameter(key: 'locationId', value: $locationId)
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(callback: static function (array $row): GetLocationItemsResult {
            return new GetLocationItemsResult(
                id: $row['id'],
                aggregateName: 'PantryLocationItem',
                kind: Location::ITEM_ARTICLE,
                refId: $row['ref_id'],
                name: $row['name'],
                emoji: (string) ($row['emoji'] ?? ''),
                unit: (string) ($row['base_unit'] ?? 'g'),
                quantity: (float) $row['quantity'],
            );
        }, array: $rows);
    }

    /**
     * @return GetLocationItemsResult[]
     */
    private function recipeItems(string $locationId): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                's.id',
                's.recipe_id AS ref_id',
                's.servings AS quantity',
                'r.name',
                'r.emoji',
            )
            ->from(table: 'recipe_stock', alias: 's')
            ->innerJoin(fromAlias: 's', join: 'recipe', alias: 'r', condition: 'r.id = s.recipe_id')
            ->where('s.location_id = :locationId')
            ->orderBy(sort: 'r.name', order: 'ASC')
            ->setParameter(key: 'locationId', value: $locationId)
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(callback: static function (array $row): GetLocationItemsResult {
            return new GetLocationItemsResult(
                id: $row['id'],
                aggregateName: 'PantryLocationItem',
                kind: Location::ITEM_RECIPE,
                refId: $row['ref_id'],
                name: $row['name'],
                emoji: (string) ($row['emoji'] ?? ''),
                unit: self::RECIPE_UNIT,
                quantity: (float) $row['quantity'],
            );
        }, array: $rows);
    }
}
