<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\ParameterType;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryEntryLotView;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryEntryNodeView;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryEntryView;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryGoals;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryMealView;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryQuickEntryView;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryResult;
use Nutrition\Diary\Diary\Domain\QueryModel\GetDiaryNeedleDataQuery;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeBreakdownItem;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeBreakdownCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final class DoctrineGetDiaryNeedleDataQuery implements GetDiaryNeedleDataQuery
{
    private const string TIMEZONE = 'Europe/Madrid';

    private const float STOCK_TOLERANCE = 0.0001;

    private ?RecipeNutritionGraph $graph = null;

    public function __construct(
        private readonly Connection $connection,
        private readonly DoctrineRecipeNutritionGraphProvider $graphProvider,
        private readonly RecipeBreakdownCalculator $breakdownCalculator,
    ) {
    }

    public function findDiaryDay(string $date): GetDiaryResult
    {
        $rows = $this->fetchEntries(date: $date);
        $goals = $this->resolveGoals(date: $date);
        $nodesByEntry = $this->fetchNodes(entryIds: array_column($rows, 'id'));
        $stockState = $this->stockStateByEntry(date: $date);
        $lots = $this->lotsByProductionItem(
            productionItemIds: array_merge(
                array_column(array: $rows, column_key: 'production_item_id'),
                array_column(array: array_merge(...array_values(array: $nodesByEntry)), column_key: 'production_item_id'),
            ),
        );

        $meals = [];
        $totals = MacroBreakdown::zero();

        foreach (DiaryEntry::MEALS as $mealKey) {
            $mealEntries = [];
            $mealTotals = MacroBreakdown::zero();

            foreach (array_filter($rows, static fn ($row): bool => $row['meal'] === $mealKey) as $row) {
                $macros = new MacroBreakdown(
                    calories: (float) $row['snapshot_calories'],
                    protein: (float) $row['snapshot_protein'],
                    fat: (float) $row['snapshot_fat'],
                    carbs: (float) $row['snapshot_carbs'],
                );

                $mealTotals = $mealTotals->add(other: $macros);

                $mealEntries[] = new DiaryEntryView(
                    id: $row['id'],
                    kind: $row['kind'],
                    refId: $row['ref_id'],
                    name: $row['snapshot_name'],
                    emoji: $row['snapshot_emoji'],
                    image: null === $row['ref_id'] ? null : $this->graph()->imageFor(kind: $row['kind'], refId: $row['ref_id']),
                    quantity: (float) $row['quantity'],
                    unit: $this->unitFor(kind: $row['kind'], storedUnit: $row['unit'] ?? null),
                    macros: $macros->rounded(),
                    quick: $this->quickView(row: $row),
                    customized: (bool) ($row['customized'] ?? false),
                    tree: $this->treeFor(row: $row, nodes: $nodesByEntry[$row['id']] ?? [], lots: $lots),
                    consumed: (bool) ($row['consumed'] ?? false),
                    stockState: $stockState[$row['id']] ?? DiaryEntryView::STOCK_NONE,
                    lot: $this->lotOf(lots: $lots, productionItemId: $row['production_item_id']),
                );
            }

            $totals = $totals->add(other: $mealTotals);

            $meals[] = new DiaryMealView(
                key: $mealKey,
                entryCount: count($mealEntries),
                totals: $mealTotals->rounded(),
                entries: $mealEntries,
                consumed: [] !== $mealEntries && array_all(
                    array: $mealEntries,
                    callback: static fn (DiaryEntryView $entry): bool => $entry->consumed,
                ),
            );
        }

        $consumed = (int) round($totals->calories);
        $goalCalories = (int) round($goals->calories);
        $percent = $goalCalories > 0 ? min(100, (int) round($consumed / $goalCalories * 100)) : 0;

        return new GetDiaryResult(
            id: $date,
            aggregateName: 'Diary',
            date: $date,
            goals: $goals,
            totals: $totals->rounded(),
            entryCount: count($rows),
            consumedCalories: $consumed,
            goalCalories: $goalCalories,
            remainingCalories: max(0, $goalCalories - $consumed),
            percent: $percent,
            meals: $meals,
        );
    }

    /**
     * @param array<string, mixed>             $row
     * @param array<int, array<string, mixed>> $nodes
     * @param array<string, DiaryEntryLotView> $lots
     *
     * @return DiaryEntryNodeView[]
     */
    private function treeFor(array $row, array $nodes, array $lots): array
    {
        if (DiaryEntry::KIND_RECIPE !== $row['kind'] || null === $row['ref_id']) {
            return [];
        }

        $items = [] !== $nodes
            ? $this->itemsFromNodes(nodes: $nodes)
            : $this->breakdownCalculator->expand(
                graph: $this->graph(),
                recipeId: $row['ref_id'],
                servings: (float) $row['quantity'],
            );

        return $this->nest(items: $items, parentPath: null, lotByPath: $this->lotByPath(nodes: $nodes, lots: $lots));
    }

    /**
     * @param array<string, DiaryEntryLotView> $lots
     */
    private function lotOf(array $lots, ?string $productionItemId): ?DiaryEntryLotView
    {
        if (null === $productionItemId) {
            return null;
        }

        return $lots[$productionItemId] ?? null;
    }

    /**
     * @param array<int, array<string, mixed>> $nodes
     * @param array<string, DiaryEntryLotView> $lots
     *
     * @return array<string, DiaryEntryLotView>
     */
    private function lotByPath(array $nodes, array $lots): array
    {
        $byPath = [];

        foreach ($nodes as $node) {
            $lot = $this->lotOf(lots: $lots, productionItemId: $node['production_item_id']);

            if (null === $lot) {
                continue;
            }

            $byPath[$node['path']] = $lot;
        }

        return $byPath;
    }

    /**
     * @param array<int, array<string, mixed>> $nodes
     *
     * @return RecipeBreakdownItem[]
     */
    private function itemsFromNodes(array $nodes): array
    {
        $graph = $this->graph();

        return array_map(static fn (array $node): RecipeBreakdownItem => new RecipeBreakdownItem(
            path: $node['path'],
            parentPath: self::parentPathOf(path: $node['path']),
            depth: (int) $node['depth'],
            position: (int) $node['position'],
            kind: $node['kind'],
            refId: $node['ref_id'],
            quantity: (float) $node['quantity'],
            unit: $node['unit'],
            name: $node['snapshot_name'],
            emoji: $node['snapshot_emoji'],
            image: $graph->imageFor(kind: $node['kind'], refId: $node['ref_id']),
            macros: new MacroBreakdown(
                calories: (float) $node['snapshot_calories'],
                protein: (float) $node['snapshot_protein'],
                fat: (float) $node['snapshot_fat'],
                carbs: (float) $node['snapshot_carbs'],
            ),
        ), $nodes);
    }

    /**
     * @param RecipeBreakdownItem[]            $items
     * @param array<string, DiaryEntryLotView> $lotByPath
     *
     * @return DiaryEntryNodeView[]
     */
    private function nest(array $items, ?string $parentPath, array $lotByPath = []): array
    {
        $views = [];

        foreach ($items as $item) {
            if ($item->parentPath !== $parentPath) {
                continue;
            }

            $views[] = new DiaryEntryNodeView(
                path: $item->path,
                kind: $item->kind,
                refId: $item->refId,
                name: $item->name,
                emoji: $item->emoji,
                image: $item->image,
                quantity: round(num: $item->quantity, precision: 2),
                unit: $item->isRecipe() ? 'rac.' : ($item->unit ?? 'g'),
                macros: $item->macros->rounded(),
                children: $this->nest(items: $items, parentPath: $item->path, lotByPath: $lotByPath),
                lot: $lotByPath[$item->path] ?? null,
            );
        }

        return $views;
    }

    private function graph(): RecipeNutritionGraph
    {
        return $this->graph ??= $this->graphProvider->load();
    }

    private static function parentPathOf(string $path): ?string
    {
        $separator = strrpos(haystack: $path, needle: DiaryEntryNode::PATH_SEPARATOR);

        return false === $separator ? null : substr(string: $path, offset: 0, length: $separator);
    }

    /**
     * @return array<string, string>
     */
    private function stockStateByEntry(string $date): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('e.id', 'e.ref_id', 'e.quantity', 'e.entry_date', 'e.meal')
            ->from(table: 'diary_entry', alias: 'e')
            ->where('e.kind = :kind')
            ->andWhere('e.consumed = :consumed')
            ->andWhere('e.ref_id IS NOT NULL')
            ->andWhere('e.entry_date BETWEEN :from AND :to')
            ->setParameter(key: 'kind', value: DiaryEntry::KIND_RECIPE)
            ->setParameter(key: 'consumed', value: false, type: ParameterType::BOOLEAN)
            ->setParameter(key: 'from', value: min($date, $this->today()))
            ->setParameter(key: 'to', value: $date)
            ->executeQuery()
            ->fetchAllAssociative();

        if ([] === $rows) {
            return [];
        }

        $remaining = $this->stockByRecipe(recipeIds: array_values(array: array_unique(array: array_column(array: $rows, column_key: 'ref_id'))));
        $mealOrder = array_flip(array: DiaryEntry::MEALS);
        usort($rows, static fn (array $left, array $right): int => [$left['entry_date'], $mealOrder[$left['meal']] ?? 0]
            <=> [$right['entry_date'], $mealOrder[$right['meal']] ?? 0]);

        $state = [];

        foreach ($rows as $row) {
            $recipeId = $row['ref_id'];
            $quantity = (float) $row['quantity'];
            $left = $remaining[$recipeId] ?? 0.0;

            if ($left + self::STOCK_TOLERANCE < $quantity) {
                $state[$row['id']] = DiaryEntryView::STOCK_SHORT;

                continue;
            }

            $remaining[$recipeId] = round(num: $left - $quantity, precision: 2);
            $state[$row['id']] = DiaryEntryView::STOCK_COVERED;
        }

        return $state;
    }

    private function today(): string
    {
        return (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: self::TIMEZONE)))
            ->format(format: 'Y-m-d');
    }

    /**
     * @param string[] $recipeIds
     *
     * @return array<string, float>
     */
    private function stockByRecipe(array $recipeIds): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('s.recipe_id', 's.servings')
            ->from(table: 'recipe_stock', alias: 's')
            ->where('s.recipe_id IN (:recipeIds)')
            ->setParameter(key: 'recipeIds', value: $recipeIds, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $stock = [];

        foreach ($rows as $row) {
            $stock[$row['recipe_id']] = (float) $row['servings'];
        }

        return $stock;
    }

    private function unitFor(string $kind, ?string $storedUnit): string
    {
        if (DiaryEntry::KIND_PRODUCT === $kind) {
            return null !== $storedUnit && '' !== $storedUnit ? $storedUnit : 'g';
        }

        return DiaryEntry::KIND_QUICK === $kind ? 'ud' : 'rac.';
    }

    /** @param array<string, mixed> $row */
    private function quickView(array $row): ?DiaryQuickEntryView
    {
        if (DiaryEntry::KIND_QUICK !== $row['kind']) {
            return null;
        }

        return new DiaryQuickEntryView(
            name: $row['quick_name'],
            emoji: $row['quick_emoji'],
            perUnit: new MacroBreakdown(
                calories: (float) $row['quick_calories'],
                protein: (float) $row['quick_protein'],
                fat: (float) $row['quick_fat'],
                carbs: (float) $row['quick_carbs'],
            ),
        );
    }

    private function resolveGoals(string $date): DiaryGoals
    {
        $snapshot = $this->connection->createQueryBuilder()
            ->select('d.calories', 'd.protein', 'd.fat', 'd.carbs')
            ->from(table: 'diary_goal_day', alias: 'd')
            ->where('d.entry_date = :date')
            ->setParameter(key: 'date', value: $date)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        if (false !== $snapshot) {
            return $this->mapGoals(row: $snapshot);
        }

        return $this->resolveCurrentGoals();
    }

    private function resolveCurrentGoals(): DiaryGoals
    {
        $config = $this->connection->createQueryBuilder()
            ->select('g.calories', 'g.protein', 'g.fat', 'g.carbs')
            ->from(table: 'diary_goal', alias: 'g')
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        if (false !== $config) {
            return $this->mapGoals(row: $config);
        }

        return DiaryGoals::default();
    }

    /** @param array<string, mixed> $row */
    private function mapGoals(array $row): DiaryGoals
    {
        return new DiaryGoals(
            calories: (float) $row['calories'],
            protein: (float) $row['protein'],
            fat: (float) $row['fat'],
            carbs: (float) $row['carbs'],
        );
    }

    /**
     * @param array<int, ?string> $productionItemIds
     *
     * @return array<string, DiaryEntryLotView>
     */
    private function lotsByProductionItem(array $productionItemIds): array
    {
        $productionItemIds = array_values(array: array_unique(array: array_filter(array: $productionItemIds)));

        if ([] === $productionItemIds) {
            return [];
        }

        $lotRows = $this->connection->createQueryBuilder()
            ->select('i.id', 'i.code', 'i.label', 'i.customized', 'i.updated_at')
            ->from(table: 'production_item', alias: 'i')
            ->where('i.id IN (:productionItemIds)')
            ->setParameter(key: 'productionItemIds', value: $productionItemIds, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $lots = [];

        foreach ($lotRows as $lotRow) {
            $lots[$lotRow['id']] = new DiaryEntryLotView(
                productionItemId: $lotRow['id'],
                code: $lotRow['code'],
                label: (string) ($lotRow['label'] ?? ''),
                cookedOn: substr(string: (string) $lotRow['updated_at'], offset: 0, length: 10),
                customized: (bool) $lotRow['customized'],
            );
        }

        return $lots;
    }

    /** @return array<int, array<string, mixed>> */
    private function fetchEntries(string $date): array
    {
        return $this->connection->createQueryBuilder()
            ->select('e.id', 'e.meal', 'e.kind', 'e.ref_id', 'e.production_item_id', 'e.quantity', 'e.unit', 'e.customized', 'e.consumed', 'e.snapshot_name', 'e.snapshot_emoji', 'e.snapshot_calories', 'e.snapshot_protein', 'e.snapshot_fat', 'e.snapshot_carbs', 'e.quick_name', 'e.quick_emoji', 'e.quick_calories', 'e.quick_protein', 'e.quick_fat', 'e.quick_carbs')
            ->from(table: 'diary_entry', alias: 'e')
            ->where('e.entry_date = :date')
            ->setParameter(key: 'date', value: $date)
            ->orderBy('e.created_at', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();
    }

    /**
     * @param array<int, string> $entryIds
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function fetchNodes(array $entryIds): array
    {
        if ([] === $entryIds) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('n.diary_entry_id', 'n.path', 'n.depth', 'n.position', 'n.kind', 'n.ref_id', 'n.production_item_id', 'n.quantity', 'n.unit', 'n.snapshot_name', 'n.snapshot_emoji', 'n.snapshot_calories', 'n.snapshot_protein', 'n.snapshot_fat', 'n.snapshot_carbs')
            ->from(table: 'diary_entry_node', alias: 'n')
            ->where('n.diary_entry_id IN (:entryIds)')
            ->setParameter(key: 'entryIds', value: $entryIds, type: ArrayParameterType::STRING)
            ->orderBy('n.depth', 'ASC')
            ->addOrderBy('n.path', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $byEntry = [];

        foreach ($rows as $row) {
            $byEntry[$row['diary_entry_id']][] = $row;
        }

        return $byEntry;
    }
}
