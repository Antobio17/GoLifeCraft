<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Service\StockBalanceCalculator;

final readonly class DoctrineStockBalanceCalculator implements StockBalanceCalculator
{
    public function __construct(private Connection $connection)
    {
    }

    public function balanceFor(string $kind, string $refId): float
    {
        $count = $this->lastCount(kind: $kind, refId: $refId);

        $balance = (float) ($count['quantity'] ?? 0.0)
            + $this->deltasAfter(kind: $kind, refId: $refId, cutOff: $count['effective_at'] ?? null);

        return round(num: $balance, precision: StockMovement::QUANTITY_PRECISION);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function lastCount(string $kind, string $refId): ?array
    {
        $row = $this->connection->createQueryBuilder()
            ->select('m.quantity', 'm.effective_at')
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

    private function deltasAfter(string $kind, string $refId, ?string $cutOff): float
    {
        $query = $this->connection->createQueryBuilder()
            ->select('COALESCE(SUM(m.quantity), 0)')
            ->from(table: 'stock_movement', alias: 'm')
            ->where('m.kind = :kind')
            ->andWhere('m.ref_id = :refId')
            ->andWhere('m.type = :type')
            ->setParameter(key: 'kind', value: $kind)
            ->setParameter(key: 'refId', value: $refId)
            ->setParameter(key: 'type', value: StockMovement::TYPE_DELTA);

        if (null !== $cutOff) {
            $query->andWhere('m.effective_at > :cutOff')->setParameter(key: 'cutOff', value: $cutOff);
        }

        return (float) $query->executeQuery()->fetchOne();
    }
}
