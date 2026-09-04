<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Nutrition\Menu\Menu\Domain\Model\MenuWeekDay;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\GetMenuResult;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuDayView;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuItemView;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuMealView;
use Nutrition\Menu\Menu\Domain\QueryModel\GetMenuNeedleDataQuery;
use Nutrition\Menu\Menu\Domain\Service\MenuItemBreakdownResolver;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final readonly class DoctrineGetMenuNeedleDataQuery implements GetMenuNeedleDataQuery
{
    private const RECIPE_BASE_UNIT = 'g';
    private const MISSING_NAME = '(deleted)';

    public function __construct(
        private Connection $connection,
        private DoctrineMenuItemRowLoader $itemRowLoader,
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private MenuItemBreakdownResolver $breakdownResolver,
    ) {
    }

    public function findMenu(string $menuId): ?GetMenuResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
                'm.id',
                'm.name',
                'm.emoji',
                'm.note',
                'm.type',
                'm.created_at',
                'm.updated_at',
                'm.created_by_user_id',
                'm.updated_by_user_id'
            )
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

        $days = array_map(
            callback: fn (?string $dayKey): MenuDayView => $this->buildDay(graph: $graph, dayKey: $dayKey, items: $items),
            array: $dayKeys,
        );

        $plannedDays = array_values(array: array_filter(
            array: $days,
            callback: static fn (MenuDayView $day): bool => $day->itemCount > 0,
        ));

        $total = MacroBreakdown::zero();
        foreach ($days as $day) {
            $total = $total->add(other: $day->totals);
        }

        $utc = new \DateTimeZone(timezone: 'UTC');
        $dayCount = max(1, count(value: $plannedDays));
        $weekDays = array_map(
            callback: static fn (MenuDayView $day): string => (string) $day->dayKey,
            array: $isWeek ? $plannedDays : [],
        );

        return new GetMenuResult(
            id: $row['id'],
            aggregateName: 'Menu',
            name: $row['name'],
            emoji: $row['emoji'],
            note: $row['note'],
            type: $row['type'],
            weekDays: $weekDays,
            days: $days,
            itemCount: count(value: $items),
            total: $total->rounded(),
            perDay: $total->scale(factor: 1 / $dayCount)->rounded(),
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }

    /**
     * @param array<int, array<string, mixed>> $items
     */
    private function buildDay(RecipeNutritionGraph $graph, ?string $dayKey, array $items): MenuDayView
    {
        $dayItems = array_values(array: array_filter(
            array: $items,
            callback: static fn (array $item): bool => $item['dayKey'] === $dayKey,
        ));

        $meals = array_map(
            callback: fn (string $meal): MenuMealView => $this->buildMeal(graph: $graph, meal: $meal, items: $dayItems),
            array: MenuItem::MEALS,
        );

        $totals = MacroBreakdown::zero();
        foreach ($meals as $meal) {
            $totals = $totals->add(other: $meal->totals);
        }

        return new MenuDayView(
            dayKey: $dayKey,
            meals: $meals,
            itemCount: count(value: $dayItems),
            totals: $totals,
        );
    }

    /**
     * @param array<int, array<string, mixed>> $items
     */
    private function buildMeal(RecipeNutritionGraph $graph, string $meal, array $items): MenuMealView
    {
        $mealItems = array_values(array: array_filter(
            array: $items,
            callback: static fn (array $item): bool => $item['meal'] === $meal,
        ));

        $views = array_map(
            callback: fn (array $item): MenuItemView => $this->buildItem(graph: $graph, item: $item),
            array: $mealItems,
        );

        $totals = MacroBreakdown::zero();
        foreach ($views as $view) {
            $totals = $totals->add(other: $view->macros);
        }

        return new MenuMealView(
            key: $meal,
            items: $views,
            itemCount: count(value: $views),
            totals: $totals->rounded(),
        );
    }

    /**
     * @param array<string, mixed> $item
     */
    private function buildItem(RecipeNutritionGraph $graph, array $item): MenuItemView
    {
        $isProduct = MenuItem::KIND_PRODUCT === $item['kind'];

        $name = $isProduct
            ? $graph->articleName(articleId: $item['refId'])
            : $graph->recipeName(recipeId: $item['refId']);

        $emoji = $isProduct
            ? $graph->articleEmoji(articleId: $item['refId'])
            : $graph->recipeEmoji(recipeId: $item['refId']);

        $baseUnit = $isProduct
            ? $graph->articleBaseUnit(articleId: $item['refId'])
            : self::RECIPE_BASE_UNIT;

        $breakdown = $this->breakdownResolver->breakdownFor(graph: $graph, item: $item);

        return new MenuItemView(
            id: $item['id'],
            dayKey: $item['dayKey'],
            meal: $item['meal'],
            kind: $item['kind'],
            refId: $item['refId'],
            name: $name ?? self::MISSING_NAME,
            emoji: $emoji,
            image: $graph->imageFor(kind: $item['kind'], refId: $item['refId']),
            quantity: $item['quantity'],
            unit: $item['unit'],
            baseUnit: $baseUnit,
            position: $item['position'],
            macros: $this->breakdownResolver->macrosFor(graph: $graph, item: $item, breakdown: $breakdown)->rounded(),
            customized: (bool) ($item['customized'] ?? false),
            tree: $this->breakdownResolver->nest(items: $breakdown, parentPath: null),
        );
    }
}
