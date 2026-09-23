<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Movement\Domain\Model\StockEvidence;
use Nutrition\Pantry\Movement\Domain\Model\StockLedgerSummary;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Service\StockLedger;

final readonly class DoctrineStockLedger implements StockLedger
{
    public function __construct(private Connection $connection)
    {
    }

    public function summaryOf(string $kind, string $refId): StockLedgerSummary
    {
        $anchor = $this->lastCount(kind: $kind, refId: $refId);
        $deltas = $this->deltasAfter(kind: $kind, refId: $refId, cutOff: $anchor['effective_at'] ?? null);

        $anchorQuantity = null !== $anchor ? (float) $anchor['quantity'] : null;

        return new StockLedgerSummary(
            balance: round(
                num: ($anchorQuantity ?? 0.0) + (float) $deltas['delta_sum'],
                precision: StockMovement::QUANTITY_PRECISION,
            ),
            observedQuantity: $anchorQuantity,
            observedAt: null !== $anchor ? new \DateTime(datetime: (string) $anchor['effective_at']) : null,
            observedConfidence: null !== $anchor
                ? StockMovement::confidenceOrDefault(
                    confidence: null !== $anchor['confidence'] ? (float) $anchor['confidence'] : null,
                    type: StockMovement::TYPE_COUNT,
                    sourceKind: (string) $anchor['source_kind'],
                )
                : null,
            inferredFlow: (float) $deltas['inferred_flow'],
            inferredSquaredFlow: (float) $deltas['inferred_squares'],
            inferredCount: (int) $deltas['inferred_count'],
            firstUnanchoredAt: null !== $deltas['first_at'] ? new \DateTime(datetime: (string) $deltas['first_at']) : null,
        );
    }

    /**
     * @return array<string, mixed>|null
     */
    private function lastCount(string $kind, string $refId): ?array
    {
        $row = $this->connection->createQueryBuilder()
            ->select('m.quantity', 'm.effective_at', 'm.confidence', 'm.source_kind')
            ->from(table: 'stock_movement', alias: 'm')
            ->where('m.kind = :kind')
            ->andWhere('m.ref_id = :refId')
            ->andWhere('m.type = :type')
            ->orderBy(sort: 'm.effective_at', order: 'DESC')
            ->addOrderBy(sort: 'm.created_at', order: 'DESC')
            ->setParameter(key: 'kind', value: $kind)
            ->setParameter(key: 'refId', value: $refId)
            ->setParameter(key: 'type', value: StockMovement::TYPE_COUNT)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        return false === $row ? null : $row;
    }

    /**
     * @return array<string, mixed>
     */
    private function deltasAfter(string $kind, string $refId, ?string $cutOff): array
    {
        $query = $this->connection->createQueryBuilder()
            ->select(
                'COALESCE(SUM(m.quantity), 0) AS delta_sum',
                'COALESCE(SUM(CASE WHEN m.source_kind IN (:inferred) THEN ABS(m.quantity) ELSE 0 END), 0) AS inferred_flow',
                'COALESCE(SUM(CASE WHEN m.source_kind IN (:inferred) THEN m.quantity * m.quantity ELSE 0 END), 0) AS inferred_squares',
                'COALESCE(SUM(CASE WHEN m.source_kind IN (:inferred) THEN 1 ELSE 0 END), 0) AS inferred_count',
                'MIN(m.effective_at) AS first_at',
            )
            ->from(table: 'stock_movement', alias: 'm')
            ->where('m.kind = :kind')
            ->andWhere('m.ref_id = :refId')
            ->andWhere('m.type = :type')
            ->setParameter(key: 'kind', value: $kind)
            ->setParameter(key: 'refId', value: $refId)
            ->setParameter(key: 'type', value: StockMovement::TYPE_DELTA)
            ->setParameter(key: 'inferred', value: StockEvidence::inferredSources(), type: ArrayParameterType::STRING);

        if (null !== $cutOff) {
            $query->andWhere('m.effective_at > :cutOff')->setParameter(key: 'cutOff', value: $cutOff);
        }

        return $query->executeQuery()->fetchAssociative() ?: [
            'delta_sum' => 0.0,
            'inferred_flow' => 0.0,
            'inferred_squares' => 0.0,
            'inferred_count' => 0,
            'first_at' => null,
        ];
    }
}
