<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryLocationPlan;
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

    public function findLocationPlans(): array
    {
        $itemsByLocation = $this->itemsByLocation();

        return array_map(callback: static function (array $row) use ($itemsByLocation): InventoryLocationPlan {
            return new InventoryLocationPlan(
                locationId: $row['id'],
                name: $row['name'],
                emoji: (string) ($row['emoji'] ?? ''),
                items: $itemsByLocation[$row['id']] ?? [],
            );
        }, array: $this->locations());
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function locations(): array
    {
        return $this->connection->createQueryBuilder()
            ->select('l.id', 'l.name', 'l.emoji')
            ->from(table: 'pantry_location', alias: 'l')
            ->orderBy(sort: 'l.name', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();
    }

    /**
     * @return array<string, InventoryStockLine[]>
     */
    private function itemsByLocation(): array
    {
        $grouped = [];

        foreach (array_merge($this->articleItems(), $this->recipeItems()) as $item) {
            $grouped[$item->locationId][] = $item;
        }

        foreach ($grouped as $locationId => $items) {
            usort(array: $items, callback: static fn (InventoryStockLine $a, InventoryStockLine $b): int => $a->name <=> $b->name);
            $grouped[$locationId] = $items;
        }

        return $grouped;
    }

    /**
     * @return InventoryStockLine[]
     */
    private function articleItems(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'i.location_id',
                'i.ref_id',
                'a.name',
                'a.emoji',
                'a.base_unit',
                's.quantity',
            )
            ->from(table: 'location_item', alias: 'i')
            ->innerJoin(fromAlias: 'i', join: 'article', alias: 'a', condition: 'a.id = i.ref_id')
            ->leftJoin(fromAlias: 'i', join: 'article_stock', alias: 's', condition: 's.article_id = i.ref_id')
            ->where('i.kind = :kind')
            ->setParameter(key: 'kind', value: InventoryLocationItem::KIND_ARTICLE)
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(callback: static function (array $row): InventoryStockLine {
            return new InventoryStockLine(
                locationId: $row['location_id'],
                kind: InventoryLocationItem::KIND_ARTICLE,
                refId: $row['ref_id'],
                name: $row['name'],
                emoji: (string) ($row['emoji'] ?? ''),
                unit: (string) ($row['base_unit'] ?? 'g'),
                quantity: (float) ($row['quantity'] ?? 0.0),
            );
        }, array: $rows);
    }

    /**
     * @return InventoryStockLine[]
     */
    private function recipeItems(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'i.location_id',
                'i.ref_id',
                'r.name',
                'r.emoji',
                's.servings AS quantity',
            )
            ->from(table: 'location_item', alias: 'i')
            ->innerJoin(fromAlias: 'i', join: 'recipe', alias: 'r', condition: 'r.id = i.ref_id')
            ->leftJoin(fromAlias: 'i', join: 'recipe_stock', alias: 's', condition: 's.recipe_id = i.ref_id')
            ->where('i.kind = :kind')
            ->setParameter(key: 'kind', value: InventoryLocationItem::KIND_RECIPE)
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(callback: static function (array $row): InventoryStockLine {
            return new InventoryStockLine(
                locationId: $row['location_id'],
                kind: InventoryLocationItem::KIND_RECIPE,
                refId: $row['ref_id'],
                name: $row['name'],
                emoji: (string) ($row['emoji'] ?? ''),
                unit: self::RECIPE_UNIT,
                quantity: (float) ($row['quantity'] ?? 0.0),
            );
        }, array: $rows);
    }
}
