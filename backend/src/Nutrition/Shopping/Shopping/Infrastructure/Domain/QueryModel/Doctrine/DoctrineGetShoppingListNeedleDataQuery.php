<?php

namespace Nutrition\Shopping\Shopping\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Shopping\Shopping\Domain\QueryModel\Dto\GetShoppingListResult;
use Nutrition\Shopping\Shopping\Domain\QueryModel\Dto\ShoppingListItemView;
use Nutrition\Shopping\Shopping\Domain\QueryModel\GetShoppingListNeedleDataQuery;

final readonly class DoctrineGetShoppingListNeedleDataQuery implements GetShoppingListNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findShoppingList(): GetShoppingListResult
    {
        $rows = $this->fetchItems();

        $items = [];
        $stores = [];
        $checkedCount = 0;
        $total = 0.0;

        foreach ($rows as $row) {
            $unitPrice = null !== $row['price'] ? (float) $row['price'] : null;
            $quantity = (int) $row['quantity'];
            $checked = (bool) $row['checked'];
            $lineTotal = round((float) ($unitPrice ?? 0.0) * $quantity, 2);

            $store = $row['store'];
            if (null !== $store && !in_array(needle: $store, haystack: $stores, strict: true)) {
                $stores[] = $store;
            }

            if ($checked) {
                ++$checkedCount;
            }

            $total += $lineTotal;

            $items[] = new ShoppingListItemView(
                id: $row['id'],
                articleId: $row['article_id'],
                name: $row['name'] ?? '(eliminado)',
                emoji: $row['emoji'] ?? '🛒',
                brand: $row['brand'],
                store: $store,
                category: $row['category'] ?? 'Otros',
                unitPrice: $unitPrice,
                quantity: $quantity,
                checked: $checked,
                lineTotal: $lineTotal,
            );
        }

        sort(array: $stores);

        return new GetShoppingListResult(
            id: 'shopping-list',
            aggregateName: 'ShoppingList',
            items: $items,
            stores: $stores,
            itemCount: count($items),
            checkedCount: $checkedCount,
            totalEstimated: round($total, 2),
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fetchItems(): array
    {
        return $this->connection->createQueryBuilder()
            ->select(
                'sli.id',
                'sli.article_id',
                'sli.quantity',
                'sli.checked',
                'a.name',
                'a.emoji',
                'a.brand',
                'a.price',
                's.name AS store',
                'c.name AS category',
            )
            ->from(table: 'shopping_list_item', alias: 'sli')
            ->leftJoin(fromAlias: 'sli', join: 'article', alias: 'a', condition: 'sli.article_id = a.id')
            ->leftJoin(fromAlias: 'a', join: 'supermarket', alias: 's', condition: 'a.supermarket_id = s.id')
            ->leftJoin(fromAlias: 'a', join: 'category', alias: 'c', condition: 'a.category_id = c.id')
            ->orderBy('sli.created_at', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();
    }
}
