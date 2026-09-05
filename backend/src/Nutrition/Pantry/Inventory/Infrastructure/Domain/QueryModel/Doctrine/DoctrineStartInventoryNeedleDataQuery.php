<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLine;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryStockLine;
use Nutrition\Pantry\Inventory\Domain\QueryModel\StartInventoryNeedleDataQuery;

final readonly class DoctrineStartInventoryNeedleDataQuery implements StartInventoryNeedleDataQuery
{
    private const string RECIPE_UNIT = 'serving';

    public function __construct(private Connection $connection)
    {
    }

    public function openInventoryId(): ?string
    {
        $result = $this->connection->createQueryBuilder()
            ->select('i.id')
            ->from(table: 'inventory', alias: 'i')
            ->where('i.status = :status')
            ->setParameter(key: 'status', value: Inventory::STATUS_DRAFT)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false === $result ? null : (string) $result;
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

    public function findStockLines(?string $locationId): array
    {
        return array_merge(
            $this->articleLines(locationId: $locationId),
            $this->recipeLines(locationId: $locationId),
        );
    }

    /**
     * @return InventoryStockLine[]
     */
    private function articleLines(?string $locationId): array
    {
        $qb = $this->connection->createQueryBuilder()
            ->select(
                's.article_id AS ref_id',
                's.quantity',
                's.location_id',
                'a.name',
                'a.emoji',
                'a.base_unit',
            )
            ->from(table: 'article_stock', alias: 's')
            ->innerJoin(fromAlias: 's', join: 'article', alias: 'a', condition: 'a.id = s.article_id')
            ->orderBy(sort: 'a.name', order: 'ASC');

        $this->applyLocation(qb: $qb, locationId: $locationId);

        return array_map(callback: static function (array $row): InventoryStockLine {
            return new InventoryStockLine(
                kind: InventoryLine::KIND_ARTICLE,
                refId: $row['ref_id'],
                locationId: $row['location_id'],
                name: $row['name'],
                emoji: (string) ($row['emoji'] ?? ''),
                unit: (string) ($row['base_unit'] ?? 'g'),
                quantity: (float) $row['quantity'],
            );
        }, array: $qb->executeQuery()->fetchAllAssociative());
    }

    /**
     * @return InventoryStockLine[]
     */
    private function recipeLines(?string $locationId): array
    {
        $qb = $this->connection->createQueryBuilder()
            ->select(
                's.recipe_id AS ref_id',
                's.servings AS quantity',
                's.location_id',
                'r.name',
                'r.emoji',
            )
            ->from(table: 'recipe_stock', alias: 's')
            ->innerJoin(fromAlias: 's', join: 'recipe', alias: 'r', condition: 'r.id = s.recipe_id')
            ->orderBy(sort: 'r.name', order: 'ASC');

        $this->applyLocation(qb: $qb, locationId: $locationId);

        return array_map(callback: static function (array $row): InventoryStockLine {
            return new InventoryStockLine(
                kind: InventoryLine::KIND_RECIPE,
                refId: $row['ref_id'],
                locationId: $row['location_id'],
                name: $row['name'],
                emoji: (string) ($row['emoji'] ?? ''),
                unit: self::RECIPE_UNIT,
                quantity: (float) $row['quantity'],
            );
        }, array: $qb->executeQuery()->fetchAllAssociative());
    }

    private function applyLocation(QueryBuilder $qb, ?string $locationId): void
    {
        if (null === $locationId) {
            return;
        }

        $qb->andWhere('s.location_id = :locationId')->setParameter(key: 'locationId', value: $locationId);
    }
}
