<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Article\Domain\Model\ArticlePack;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryShoppingNeedView;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryShoppingNeedsResult;
use Nutrition\Diary\Diary\Domain\QueryModel\GetDiaryShoppingNeedsNeedleDataQuery;
use Nutrition\Diary\Diary\Domain\Service\DiaryArticleNeedsCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final readonly class DoctrineGetDiaryShoppingNeedsNeedleDataQuery implements GetDiaryShoppingNeedsNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private DiaryArticleNeedsCalculator $needsCalculator,
    ) {
    }

    public function findShoppingNeeds(string $fromDate, string $toDate): GetDiaryShoppingNeedsResult
    {
        $entries = $this->fetchEntries(fromDate: $fromDate, toDate: $toDate);
        $nodesByEntry = $this->fetchProductNodes(entryIds: array_column($entries, 'id'));

        $quantities = $this->needsCalculator->accumulate(
            graph: $this->graphProvider->load(),
            items: $this->buildItems(entries: $entries, nodesByEntry: $nodesByEntry),
        );

        $needs = $this->buildNeeds(quantities: $quantities);

        return new GetDiaryShoppingNeedsResult(
            id: sprintf('%s..%s', $fromDate, $toDate),
            aggregateName: 'DiaryShoppingNeeds',
            fromDate: $fromDate,
            toDate: $toDate,
            dayCount: count(array_unique(array_column($entries, 'entry_date'))),
            entryCount: count($entries),
            needs: $needs,
            needCount: count($needs),
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fetchEntries(string $fromDate, string $toDate): array
    {
        return $this->connection->createQueryBuilder()
            ->select('e.id', 'e.entry_date', 'e.kind', 'e.ref_id', 'e.quantity', 'e.unit')
            ->from(table: 'diary_entry', alias: 'e')
            ->where('e.entry_date >= :fromDate')
            ->andWhere('e.entry_date <= :toDate')
            ->andWhere('e.kind IN (:kinds)')
            ->andWhere('e.ref_id IS NOT NULL')
            ->setParameter(key: 'fromDate', value: $fromDate)
            ->setParameter(key: 'toDate', value: $toDate)
            ->setParameter(key: 'kinds', value: [DiaryEntry::KIND_PRODUCT, DiaryEntry::KIND_RECIPE], type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();
    }

    /**
     * @param array<int, string> $entryIds
     *
     * @return array<string, array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>>
     */
    private function fetchProductNodes(array $entryIds): array
    {
        if ([] === $entryIds) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('n.diary_entry_id', 'n.kind', 'n.ref_id', 'n.quantity', 'n.unit')
            ->from(table: 'diary_entry_node', alias: 'n')
            ->where('n.diary_entry_id IN (:entryIds)')
            ->andWhere('n.kind = :kind')
            ->setParameter(key: 'entryIds', value: $entryIds, type: ArrayParameterType::STRING)
            ->setParameter(key: 'kind', value: DiaryEntryNode::KIND_PRODUCT)
            ->executeQuery()
            ->fetchAllAssociative();

        $nodes = [];

        foreach ($rows as $row) {
            $nodes[$row['diary_entry_id']][] = [
                'kind' => DiaryEntryNode::KIND_PRODUCT,
                'refId' => (string) $row['ref_id'],
                'quantity' => (float) $row['quantity'],
                'unit' => null !== $row['unit'] ? (string) $row['unit'] : null,
            ];
        }

        return $nodes;
    }

    /**
     * @param array<int, array<string, mixed>>                                                              $entries
     * @param array<string, array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>> $nodesByEntry
     *
     * @return array<int, array{kind: string, refId: string, quantity: float, unit: ?string}>
     */
    private function buildItems(array $entries, array $nodesByEntry): array
    {
        $items = [];

        foreach ($entries as $entry) {
            if (DiaryEntry::KIND_RECIPE === $entry['kind'] && isset($nodesByEntry[$entry['id']])) {
                $items = array_merge($items, $nodesByEntry[$entry['id']]);

                continue;
            }

            $items[] = [
                'kind' => (string) $entry['kind'],
                'refId' => (string) $entry['ref_id'],
                'quantity' => (float) $entry['quantity'],
                'unit' => null !== $entry['unit'] ? (string) $entry['unit'] : null,
            ];
        }

        return $items;
    }

    /**
     * @param array<string, float> $quantities
     *
     * @return DiaryShoppingNeedView[]
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
                'a.price',
                'ae.quantity AS pack_size',
                's.name AS store',
                'st.quantity AS stock_quantity',
                'MIN(sli.id) AS shopping_list_item_id',
            )
            ->from(table: 'article', alias: 'a')
            ->leftJoin('a', 'supermarket', 's', 's.id = a.supermarket_id')
            ->leftJoin('a', 'article_equivalence', 'ae', 'ae.article_id = a.id AND ae.unit = a.pack_unit')
            ->leftJoin('a', 'article_stock', 'st', 'st.article_id = a.id')
            ->leftJoin('a', 'shopping_list_item', 'sli', 'sli.article_id = a.id')
            ->where('a.id IN (:articleIds)')
            ->setParameter(key: 'articleIds', value: array_keys($quantities), type: ArrayParameterType::STRING)
            ->groupBy('a.id', 'a.name', 'a.emoji', 'a.brand', 'a.base_unit', 'a.pack_unit', 'a.price', 'ae.quantity', 's.name', 'st.quantity')
            ->orderBy(sort: 'a.name', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $needs = [];

        foreach ($rows as $row) {
            $pack = ArticlePack::fromEquivalence(
                unit: $row['pack_unit'],
                size: null !== $row['pack_size'] ? (float) $row['pack_size'] : null,
            );

            $stock = null !== $row['stock_quantity'] ? (float) $row['stock_quantity'] : 0.0;
            $missing = max(0.0, $quantities[$row['id']] - $stock);

            $needs[] = new DiaryShoppingNeedView(
                articleId: $row['id'],
                name: $row['name'],
                emoji: $row['emoji'] ?? '🥫',
                brand: $row['brand'],
                store: $row['store'],
                price: null !== $row['price'] ? (float) $row['price'] : null,
                quantity: round(num: $quantities[$row['id']], precision: 1),
                stockQuantity: round(num: $stock, precision: 1),
                missingQuantity: round(num: $missing, precision: 1),
                baseUnit: $row['base_unit'] ?? 'g',
                packUnit: $pack->unit,
                packSize: $pack->size,
                packs: $missing > 0.0 ? $pack->packsFor(baseQuantity: $missing) : 0,
                inShoppingList: null !== $row['shopping_list_item_id'],
            );
        }

        return $needs;
    }
}
