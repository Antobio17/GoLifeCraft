<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
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
            observedConfidence: null !== $anchor
                ? StockMovement::countConfidence(
                    confidence: null !== $anchor['confidence'] ? (float) $anchor['confidence'] : null,
                    sourceKind: (string) $anchor['source_kind'],
                )
                : null,
            inferredSquaredFlow: (float) $deltas['inferred_squares'],
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
                'COALESCE(SUM(CASE WHEN m.source_kind IN (:inferred) THEN m.quantity * m.quantity ELSE 0 END), 0) AS inferred_squares',
            )
            ->from(table: 'stock_movement', alias: 'm')
            ->where('m.kind = :kind')
            ->andWhere('m.ref_id = :refId')
            ->andWhere('m.type = :type')
            ->setParameter(key: 'kind', value: $kind)
            ->setParameter(key: 'refId', value: $refId)
            ->setParameter(key: 'type', value: StockMovement::TYPE_DELTA)
            ->setParameter(key: 'inferred', value: StockMovement::INFERRED_SOURCES, type: ArrayParameterType::STRING);

        if (null !== $cutOff) {
            $query->andWhere('m.effective_at > :cutOff')->setParameter(key: 'cutOff', value: $cutOff);
        }

        return $query->executeQuery()->fetchAssociative() ?: ['delta_sum' => 0.0, 'inferred_squares' => 0.0];
    }
}
