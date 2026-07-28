<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuWeekDay;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\GetMenusResult;
use Nutrition\Menu\Menu\Domain\QueryModel\GetMenusNeedleDataQuery;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeNutritionCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final readonly class DoctrineGetMenusNeedleDataQuery implements GetMenusNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineMenuItemRowLoader $itemRowLoader,
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private RecipeNutritionCalculator $calculator,
    ) {
    }

    public function findMenus(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $filterType = null,
        ?string $orderBy = null,
    ): array {
        $qb = $this->getBaseQuery(filterName: $filterName, filterType: $filterType)->select(
            'm.id',
            'm.name',
            'm.emoji',
            'm.note',
            'm.type',
            'm.created_at',
            'm.updated_at',
            'm.created_by_user_id',
            'm.updated_by_user_id'
        );

        $this->applyOrdering(qb: $qb, orderBy: $orderBy);

        $rows = $qb->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        if ([] === $rows) {
            return [];
        }

        $itemsByMenu = $this->itemRowLoader->loadByMenuIds(menuIds: array_column(array: $rows, column_key: 'id'));
        $graph = $this->graphProvider->load();
        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: function (array $row) use ($itemsByMenu, $graph, $utc): GetMenusResult {
            $items = $itemsByMenu[$row['id']] ?? [];
            $isWeek = Menu::TYPE_WEEK === $row['type'];
            $weekDays = $isWeek ? $this->plannedWeekDays(items: $items) : [];
            $dayCount = $isWeek ? count(value: $weekDays) : 1;

            $total = MacroBreakdown::zero();
            foreach ($items as $item) {
                $total = $total->add(other: $this->calculator->ingredientContribution(
                    graph: $graph,
                    kind: $item['kind'],
                    refId: $item['refId'],
                    quantity: $item['quantity'],
                    unit: $item['unit'],
                ));
            }

            return new GetMenusResult(
                id: $row['id'],
                aggregateName: 'Menu',
                name: $row['name'],
                emoji: $row['emoji'],
                note: $row['note'],
                type: $row['type'],
                weekDays: $weekDays,
                dayCount: $dayCount,
                itemCount: count(value: $items),
                total: $total->rounded(),
                perDay: $total->scale(factor: 1 / max(1, $dayCount))->rounded(),
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            );
        }, array: $rows);
    }

    /**
     * A weekly menu plans exactly the days that hold food.
     *
     * @param array<int, array<string, mixed>> $items
     *
     * @return array<int, string>
     */
    private function plannedWeekDays(array $items): array
    {
        return MenuWeekDay::sort(dayKeys: array_map(
            callback: static fn (array $item): string => (string) $item['dayKey'],
            array: $items,
        ));
    }

    public function totalMenus(?string $filterName = null, ?string $filterType = null): int
    {
        return (int) $this->getBaseQuery(filterName: $filterName, filterType: $filterType)
            ->select('COUNT(*)')
            ->executeQuery()
            ->fetchOne();
    }

    private function getBaseQuery(?string $filterName, ?string $filterType): QueryBuilder
    {
        $qb = $this->connection->createQueryBuilder()->from(table: 'menu', alias: 'm');

        if (null !== $filterName) {
            $qb->andWhere('(m.name LIKE :name OR m.note LIKE :name)')
                ->setParameter(key: 'name', value: '%'.$filterName.'%');
        }

        if (null !== $filterType) {
            $qb->andWhere('m.type = :type')
                ->setParameter(key: 'type', value: $filterType);
        }

        return $qb;
    }

    private function applyOrdering(QueryBuilder $qb, ?string $orderBy): void
    {
        $allowedFields = [
            'name' => 'm.name',
            'type' => 'm.type',
            'createdAt' => 'm.created_at',
            'updatedAt' => 'm.updated_at',
        ];

        if (null === $orderBy) {
            $qb->orderBy(sort: 'm.created_at', order: 'DESC');

            return;
        }

        $direction = 'ASC';
        $field = $orderBy;

        if (str_starts_with(haystack: $orderBy, needle: '-')) {
            $direction = 'DESC';
            $field = substr(string: $orderBy, offset: 1);
        }

        if (!isset($allowedFields[$field])) {
            $qb->orderBy(sort: 'm.created_at', order: 'DESC');

            return;
        }

        $qb->orderBy(sort: $allowedFields[$field], order: $direction);
    }
}
