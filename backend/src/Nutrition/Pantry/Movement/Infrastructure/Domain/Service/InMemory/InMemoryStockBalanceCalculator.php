<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\Service\InMemory;

use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Model\StockMovementRepository;
use Nutrition\Pantry\Movement\Domain\Service\StockBalanceCalculator;

final readonly class InMemoryStockBalanceCalculator implements StockBalanceCalculator
{
    public function __construct(private StockMovementRepository $stockMovementRepository)
    {
    }

    public function balanceFor(string $kind, string $refId): float
    {
        $movements = $this->stockMovementRepository->findAllByReference(kind: $kind, refId: $refId);
        $lastCount = self::lastCount(movements: $movements);

        $balance = null === $lastCount ? 0.0 : $lastCount->quantity;

        foreach ($movements as $movement) {
            $balance += self::countedDelta(movement: $movement, lastCount: $lastCount);
        }

        return round(num: $balance, precision: StockMovement::QUANTITY_PRECISION);
    }

    /**
     * @param StockMovement[] $movements
     */
    private static function lastCount(array $movements): ?StockMovement
    {
        $lastCount = null;

        foreach ($movements as $movement) {
            if (StockMovement::TYPE_COUNT !== $movement->type) {
                continue;
            }

            if (null !== $lastCount && !self::isLaterThan(movement: $movement, other: $lastCount)) {
                continue;
            }

            $lastCount = $movement;
        }

        return $lastCount;
    }

    private static function countedDelta(StockMovement $movement, ?StockMovement $lastCount): float
    {
        if (StockMovement::TYPE_DELTA !== $movement->type) {
            return 0.0;
        }

        if (null !== $lastCount && $movement->effectiveAt <= $lastCount->effectiveAt) {
            return 0.0;
        }

        return $movement->quantity;
    }

    private static function isLaterThan(StockMovement $movement, StockMovement $other): bool
    {
        if ($movement->effectiveAt != $other->effectiveAt) {
            return $movement->effectiveAt > $other->effectiveAt;
        }

        return $movement->createdAt >= $other->createdAt;
    }
}
