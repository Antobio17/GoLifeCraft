<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Article\Domain\Model\ArticlePack;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\GetMenuShoppingNeedsResult;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuShoppingNeedView;
use Nutrition\Menu\Menu\Domain\QueryModel\GetMenuShoppingNeedsNeedleDataQuery;
use Nutrition\Menu\Menu\Domain\Service\MenuArticleNeedsCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final readonly class DoctrineGetMenuShoppingNeedsNeedleDataQuery implements GetMenuShoppingNeedsNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineMenuItemRowLoader $itemRowLoader,
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private MenuArticleNeedsCalculator $needsCalculator,
    ) {
    }

    public function findShoppingNeeds(string $menuId): ?GetMenuShoppingNeedsResult
    {
        $menu = $this->connection->createQueryBuilder()
            ->select('m.id', 'm.name', 'm.emoji')
            ->from(table: 'menu', alias: 'm')
            ->where('m.id = :menuId')
            ->setParameter(key: 'menuId', value: $menuId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $menu) {
            return null;
        }

        $items = $this->itemRowLoader->loadByMenuIds(menuIds: [$menuId])[$menuId] ?? [];
        $quantities = $this->needsCalculator->accumulate(
            graph: $this->graphProvider->load(),
            items: $items,
        );

        $needs = $this->buildNeeds(quantities: $quantities);

        return new GetMenuShoppingNeedsResult(
            id: $menuId,
            aggregateName: 'MenuShoppingNeeds',
            menuName: $menu['name'],
            menuEmoji: $menu['emoji'],
            needs: $needs,
            needCount: count(value: $needs),
        );
    }

    /**
     * @param array<string, float> $quantities
     *
     * @return MenuShoppingNeedView[]
     */
    private function buildNeeds(array $quantities): array
    {
        if ([] === $quantities) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select(
                'a.id',
                'a.name',
                'a.emoji',
                'a.brand',
                'a.base_unit',
                'a.pack_unit',
                'ae.quantity AS pack_size',
                's.name AS store',
                'sli.id AS shopping_list_item_id',
            )
            ->from(table: 'article', alias: 'a')
            ->leftJoin('a', 'supermarket', 's', 's.id = a.supermarket_id')
            ->leftJoin('a', 'article_equivalence', 'ae', 'ae.article_id = a.id AND ae.unit = a.pack_unit')
            ->leftJoin('a', 'shopping_list_item', 'sli', 'sli.article_id = a.id')
            ->where('a.id IN (:articleIds)')
            ->setParameter(key: 'articleIds', value: array_keys($quantities), type: ArrayParameterType::STRING)
            ->orderBy(sort: 'a.name', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $needs = [];

        foreach ($rows as $row) {
            $pack = ArticlePack::fromEquivalence(
                unit: $row['pack_unit'],
                size: null !== $row['pack_size'] ? (float) $row['pack_size'] : null,
            );

            $needs[] = new MenuShoppingNeedView(
                articleId: $row['id'],
                name: $row['name'],
                emoji: $row['emoji'] ?? '🥫',
                brand: $row['brand'],
                store: $row['store'],
                quantity: round(num: $quantities[$row['id']], precision: 1),
                baseUnit: $row['base_unit'] ?? 'g',
                packUnit: $pack->unit,
                packSize: $pack->size,
                packs: $pack->packsFor(baseQuantity: $quantities[$row['id']]),
                inShoppingList: null !== $row['shopping_list_item_id'],
            );
        }

        return $needs;
    }
}
