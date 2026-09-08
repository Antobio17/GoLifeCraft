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
                'i.id',
                'i.ref_id',
                'a.name',
                'a.emoji',
                'a.image',
                'a.base_unit',
                's.quantity',
            )
            ->from(table: 'location_item', alias: 'i')
            ->innerJoin(fromAlias: 'i', join: 'article', alias: 'a', condition: 'a.id = i.ref_id')
            ->leftJoin(fromAlias: 'i', join: 'article_stock', alias: 's', condition: 's.article_id = i.ref_id')
            ->where('i.location_id = :locationId')
            ->andWhere('i.kind = :kind')
            ->orderBy(sort: 'a.name', order: 'ASC')
            ->setParameter(key: 'locationId', value: $locationId)
            ->setParameter(key: 'kind', value: Location::ITEM_ARTICLE)
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
                image: $row['image'] ?? null,
                unit: (string) ($row['base_unit'] ?? 'g'),
                quantity: (float) ($row['quantity'] ?? 0.0),
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
                'i.id',
                'i.ref_id',
                'r.name',
                'r.emoji',
                'r.image',
                's.servings AS quantity',
            )
            ->from(table: 'location_item', alias: 'i')
            ->innerJoin(fromAlias: 'i', join: 'recipe', alias: 'r', condition: 'r.id = i.ref_id')
            ->leftJoin(fromAlias: 'i', join: 'recipe_stock', alias: 's', condition: 's.recipe_id = i.ref_id')
            ->where('i.location_id = :locationId')
            ->andWhere('i.kind = :kind')
            ->orderBy(sort: 'r.name', order: 'ASC')
            ->setParameter(key: 'locationId', value: $locationId)
            ->setParameter(key: 'kind', value: Location::ITEM_RECIPE)
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
                image: $row['image'] ?? null,
                unit: self::RECIPE_UNIT,
                quantity: (float) ($row['quantity'] ?? 0.0),
            );
        }, array: $rows);
    }
}
