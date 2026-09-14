<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryLocationPlan;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryStockLine;
use Nutrition\Pantry\Inventory\Domain\QueryModel\StartInventoryNeedleDataQuery;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;

final readonly class DoctrineStartInventoryNeedleDataQuery implements StartInventoryNeedleDataQuery
{
    private const string RECIPE_UNIT = 'serving';
    private const string UNPLACED_KEY = '';

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
        $plans = [];

        foreach ($this->locations() as $row) {
            $plans[] = new InventoryLocationPlan(
                locationId: $row['id'],
                name: $row['name'],
                emoji: (string) ($row['emoji'] ?? ''),
                items: $itemsByLocation[$row['id']] ?? [],
            );
        }

        if (isset($itemsByLocation[self::UNPLACED_KEY])) {
            $plans[] = new InventoryLocationPlan(
                locationId: null,
                name: 'Sin ubicar',
                emoji: '📦',
                items: $itemsByLocation[self::UNPLACED_KEY],
            );
        }

        return $plans;
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
            $grouped[$item->locationId ?? self::UNPLACED_KEY][] = $item;
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
        $rows = $this->connection->executeQuery(sql: <<<SQL
            SELECT i.location_id, a.id AS ref_id, a.name, a.emoji, a.base_unit, s.quantity
            FROM article a
            LEFT JOIN article_stock s ON s.article_id = a.id
            LEFT JOIN location_item i ON i.ref_id = a.id AND i.kind = :locationKind
            WHERE i.ref_id IS NOT NULL
               OR s.quantity <> 0
               OR EXISTS (SELECT 1 FROM stock_movement m WHERE m.ref_id = a.id AND m.kind = :movementKind)
            SQL, params: [
            'locationKind' => InventoryLocationItem::KIND_ARTICLE,
            'movementKind' => StockMovement::KIND_ARTICLE,
        ])->fetchAllAssociative();

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
        $rows = $this->connection->executeQuery(sql: <<<SQL
            SELECT i.location_id, r.id AS ref_id, r.name, r.emoji, s.servings AS quantity
            FROM recipe r
            LEFT JOIN recipe_stock s ON s.recipe_id = r.id
            LEFT JOIN location_item i ON i.ref_id = r.id AND i.kind = :locationKind
            WHERE i.ref_id IS NOT NULL
               OR s.servings <> 0
               OR EXISTS (SELECT 1 FROM stock_movement m WHERE m.ref_id = r.id AND m.kind = :movementKind)
            SQL, params: [
            'locationKind' => InventoryLocationItem::KIND_RECIPE,
            'movementKind' => StockMovement::KIND_RECIPE,
        ])->fetchAllAssociative();

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
