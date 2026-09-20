<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\ParameterType;
use Nutrition\Catalog\Article\Domain\Model\ArticlePack;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryShoppingNeedView;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryShoppingNeedsResult;
use Nutrition\Diary\Diary\Domain\QueryModel\GetDiaryShoppingNeedsNeedleDataQuery;
use Nutrition\Diary\Diary\Domain\Service\DiaryArticleNeedsCalculator;
use Nutrition\Pantry\Movement\Domain\Model\StockLevel;
use Nutrition\Pantry\Stock\Domain\Model\StockEstimate;
use Nutrition\Pantry\Stock\Domain\Model\StockNeed;
use Nutrition\Pantry\Stock\Domain\Model\StockTrackingMode;
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
            ->andWhere('e.consumed = :consumed')
            ->setParameter(key: 'fromDate', value: $fromDate)
            ->setParameter(key: 'toDate', value: $toDate)
            ->setParameter(key: 'kinds', value: [DiaryEntry::KIND_PRODUCT, DiaryEntry::KIND_RECIPE], type: ArrayParameterType::STRING)
            ->setParameter(key: 'consumed', value: false, type: ParameterType::BOOLEAN)
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
                'a.image',
                'a.brand',
                'a.base_unit',
                'a.pack_unit',
                'a.diary_unit',
                'a.recipe_unit',
                'a.price',
                's.name AS store',
                'st.quantity AS stock_quantity',
                'st.tracking_mode AS stock_tracking_mode',
                'st.confidence AS stock_confidence',
                'st.uncertainty AS stock_uncertainty',
                'st.min_quantity AS stock_min_quantity',
                'st.max_quantity AS stock_max_quantity',
                'st.level AS stock_level',
                'st.reference_quantity AS stock_reference_quantity',
                'st.observed_at AS stock_observed_at',
                'st.observed_quantity AS stock_observed_quantity',
                'st.inferred_count AS stock_inferred_count',
                'st.inferred_flow AS stock_inferred_flow',
                'MIN(sli.id) AS shopping_list_item_id',
            )
            ->from(table: 'article', alias: 'a')
            ->leftJoin('a', 'supermarket', 's', 's.id = a.supermarket_id')
            ->leftJoin('a', 'article_stock', 'st', 'st.article_id = a.id')
            ->leftJoin('a', 'shopping_list_item', 'sli', 'sli.article_id = a.id')
            ->where('a.id IN (:articleIds)')
            ->setParameter(key: 'articleIds', value: array_keys($quantities), type: ArrayParameterType::STRING)
            ->groupBy(
                'a.id',
                'a.name',
                'a.emoji',
                'a.image',
                'a.brand',
                'a.base_unit',
                'a.pack_unit',
                'a.diary_unit',
                'a.recipe_unit',
                'a.price',
                's.name',
                'st.quantity',
                'st.tracking_mode',
                'st.confidence',
                'st.uncertainty',
                'st.min_quantity',
                'st.max_quantity',
                'st.level',
                'st.reference_quantity',
                'st.observed_at',
                'st.observed_quantity',
                'st.inferred_count',
                'st.inferred_flow',
            )
            ->orderBy(sort: 'a.name', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $equivalences = $this->fetchEquivalences(articleIds: array_keys($quantities));
        $needs = [];

        foreach ($rows as $row) {
            $pack = $this->resolvePurchaseUnit(row: $row, equivalences: $equivalences[$row['id']] ?? []);
            $estimate = self::estimateOf(row: $row);
            $need = StockNeed::assess(
                estimate: $estimate,
                neededQuantity: $quantities[$row['id']],
                packSize: $pack->size,
            );

            $needs[] = new DiaryShoppingNeedView(
                articleId: $row['id'],
                name: $row['name'],
                emoji: $row['emoji'] ?? '🥫',
                image: $row['image'] ?? null,
                brand: $row['brand'],
                store: $row['store'],
                price: null !== $row['price'] ? (float) $row['price'] : null,
                quantity: round(num: $need->neededQuantity, precision: 1),
                stockQuantity: round(num: $estimate->quantity, precision: 1),
                missingQuantity: round(num: $need->deficit, precision: 1),
                baseUnit: $row['base_unit'] ?? 'g',
                packUnit: $pack->unit,
                packSize: $pack->size,
                packs: $need->packs,
                inShoppingList: null !== $row['shopping_list_item_id'],
                trackingMode: $estimate->trackingMode->value,
                stockConfidence: $estimate->confidence,
                stockMinQuantity: null !== $estimate->minQuantity ? round(num: $estimate->minQuantity, precision: 1) : null,
                stockMaxQuantity: null !== $estimate->maxQuantity ? round(num: $estimate->maxQuantity, precision: 1) : null,
                stockLevel: $estimate->level->value,
                sufficiency: $need->sufficiency->value,
                safeMissingQuantity: round(num: $need->safeDeficit, precision: 1),
                safePacks: $need->safePacks,
            );
        }

        return $needs;
    }

    /**
     * @param array<string, mixed> $row
     */
    private static function estimateOf(array $row): StockEstimate
    {
        return new StockEstimate(
            quantity: null !== $row['stock_quantity'] ? (float) $row['stock_quantity'] : 0.0,
            trackingMode: StockTrackingMode::fromValue(value: $row['stock_tracking_mode'] ?? null),
            confidence: null !== $row['stock_confidence'] ? (float) $row['stock_confidence'] : 0.0,
            uncertainty: null !== $row['stock_uncertainty'] ? (float) $row['stock_uncertainty'] : null,
            minQuantity: null !== $row['stock_min_quantity'] ? (float) $row['stock_min_quantity'] : null,
            maxQuantity: null !== $row['stock_max_quantity'] ? (float) $row['stock_max_quantity'] : null,
            level: StockLevel::tryFrom(value: (string) ($row['stock_level'] ?? '')) ?? StockLevel::UNKNOWN,
            referenceQuantity: null !== $row['stock_reference_quantity'] ? (float) $row['stock_reference_quantity'] : null,
            observedAt: null !== $row['stock_observed_at'] ? new \DateTime(datetime: (string) $row['stock_observed_at']) : null,
            observedQuantity: null !== $row['stock_observed_quantity'] ? (float) $row['stock_observed_quantity'] : null,
            inferredCount: (int) ($row['stock_inferred_count'] ?? 0),
            inferredFlow: (float) ($row['stock_inferred_flow'] ?? 0.0),
        );
    }

    /**
     * @param array<int, string> $articleIds
     *
     * @return array<string, array<string, float>>
     */
    private function fetchEquivalences(array $articleIds): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('e.article_id', 'e.unit', 'e.quantity')
            ->from(table: 'article_equivalence', alias: 'e')
            ->where('e.article_id IN (:articleIds)')
            ->setParameter(key: 'articleIds', value: $articleIds, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $equivalences = [];

        foreach ($rows as $row) {
            $equivalences[$row['article_id']][$row['unit']] = (float) $row['quantity'];
        }

        return $equivalences;
    }

    /**
     * @param array<string, mixed> $row
     * @param array<string, float> $equivalences
     */
    private function resolvePurchaseUnit(array $row, array $equivalences): ArticlePack
    {
        foreach ([$row['pack_unit'], $row['diary_unit'], $row['recipe_unit']] as $unit) {
            if (null === $unit || !isset($equivalences[$unit])) {
                continue;
            }

            $pack = ArticlePack::fromEquivalence(unit: $unit, size: $equivalences[$unit]);
            if ($pack->isDefined()) {
                return $pack;
            }
        }

        return ArticlePack::fromEquivalence(unit: null, size: null);
    }
}
