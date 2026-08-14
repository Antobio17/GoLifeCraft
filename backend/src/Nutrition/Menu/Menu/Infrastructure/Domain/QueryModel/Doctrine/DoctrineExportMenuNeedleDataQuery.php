<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Nutrition\Menu\Menu\Domain\Model\MenuWeekDay;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\ExportMenuResult;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuExportDayView;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuExportItemView;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuExportMealView;
use Nutrition\Menu\Menu\Domain\QueryModel\ExportMenuNeedleDataQuery;
use Nutrition\Menu\Menu\Domain\Service\MenuItemBreakdownResolver;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DoctrineExportMenuNeedleDataQuery implements ExportMenuNeedleDataQuery
{
    private const SERVING_UNIT = 'serving';
    private const MISSING_NAME = '(deleted)';

    public function __construct(
        private Connection $connection,
        private DoctrineMenuItemRowLoader $itemRowLoader,
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private MenuItemBreakdownResolver $breakdownResolver,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function findMenuToExport(string $menuId): ?ExportMenuResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select('m.id', 'm.name', 'm.emoji', 'm.note', 'm.type')
            ->from(table: 'menu', alias: 'm')
            ->where('m.id = :menuId')
            ->setParameter(key: 'menuId', value: $menuId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $items = $this->itemRowLoader->loadByMenuIds(menuIds: [$menuId])[$menuId] ?? [];
        $graph = $this->graphProvider->load();
        $isWeek = Menu::TYPE_WEEK === $row['type'];
        $dayKeys = $isWeek ? MenuWeekDay::KEYS : [null];

        $days = array_values(array: array_filter(
            array: array_map(
                callback: fn (?string $dayKey): MenuExportDayView => $this->buildDay(graph: $graph, dayKey: $dayKey, items: $items),
                array: $dayKeys,
            ),
            callback: static fn (MenuExportDayView $day): bool => $day->itemCount > 0,
        ));

        $total = MacroBreakdown::zero();
        foreach ($days as $day) {
            $total = $total->add(other: $day->totals);
        }

        $dayCount = max(1, count(value: $days));

        return new ExportMenuResult(
            id: $row['id'],
            aggregateName: 'MenuDocument',
            name: $row['name'],
            emoji: $row['emoji'],
            note: $row['note'],
            type: $row['type'],
            days: $days,
            itemCount: count(value: $items),
            plannedDayCount: count(value: $days),
            total: $total->rounded(),
            perDay: $total->scale(factor: 1 / $dayCount)->rounded(),
            generatedAt: $this->dateTimeGenerator->now(),
        );
    }

    /**
     * @param array<int, array<string, mixed>> $items
     */
    private function buildDay(RecipeNutritionGraph $graph, ?string $dayKey, array $items): MenuExportDayView
    {
        $dayItems = array_values(array: array_filter(
            array: $items,
            callback: static fn (array $item): bool => $item['dayKey'] === $dayKey,
        ));

        $meals = array_values(array: array_filter(
            array: array_map(
                callback: fn (string $meal): MenuExportMealView => $this->buildMeal(graph: $graph, meal: $meal, items: $dayItems),
                array: MenuItem::MEALS,
            ),
            callback: static fn (MenuExportMealView $meal): bool => [] !== $meal->items,
        ));

        $totals = MacroBreakdown::zero();
        foreach ($meals as $meal) {
            $totals = $totals->add(other: $meal->totals);
        }

        return new MenuExportDayView(
            dayKey: $dayKey,
            meals: $meals,
            itemCount: count(value: $dayItems),
            totals: $totals->rounded(),
        );
    }

    /**
     * @param array<int, array<string, mixed>> $items
     */
    private function buildMeal(RecipeNutritionGraph $graph, string $meal, array $items): MenuExportMealView
    {
        $mealItems = array_values(array: array_filter(
            array: $items,
            callback: static fn (array $item): bool => $item['meal'] === $meal,
        ));

        $views = array_map(
            callback: fn (array $item): MenuExportItemView => $this->buildItem(graph: $graph, item: $item),
            array: $mealItems,
        );

        $totals = MacroBreakdown::zero();
        foreach ($views as $view) {
            $totals = $totals->add(other: $view->macros);
        }

        return new MenuExportMealView(
            key: $meal,
            items: $views,
            totals: $totals->rounded(),
        );
    }

    /**
     * @param array<string, mixed> $item
     */
    private function buildItem(RecipeNutritionGraph $graph, array $item): MenuExportItemView
    {
        $isProduct = MenuItem::KIND_PRODUCT === $item['kind'];

        $name = $isProduct
            ? $graph->articleName(articleId: $item['refId'])
            : $graph->recipeName(recipeId: $item['refId']);

        $unit = $isProduct
            ? ($item['unit'] ?? $graph->articleBaseUnit(articleId: $item['refId']))
            : self::SERVING_UNIT;

        $breakdown = $this->breakdownResolver->breakdownFor(graph: $graph, item: $item);

        return new MenuExportItemView(
            kind: $item['kind'],
            refId: $item['refId'],
            name: $name ?? self::MISSING_NAME,
            emoji: $isProduct
                ? $graph->articleEmoji(articleId: $item['refId'])
                : $graph->recipeEmoji(recipeId: $item['refId']),
            quantity: round(num: $item['quantity'], precision: 2),
            unit: $unit,
            servings: $isProduct ? null : $graph->recipeServings(recipeId: $item['refId']),
            customized: (bool) ($item['customized'] ?? false),
            tree: $this->breakdownResolver->nest(items: $breakdown, parentPath: null),
            macros: $this->breakdownResolver->macrosFor(graph: $graph, item: $item, breakdown: $breakdown)->rounded(),
        );
    }
}
