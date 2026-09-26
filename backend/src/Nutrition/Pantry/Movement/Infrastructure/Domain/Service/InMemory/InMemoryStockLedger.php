<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\Service\InMemory;

use Nutrition\Pantry\Movement\Domain\Model\StockLedgerSummary;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Model\StockMovementRepository;
use Nutrition\Pantry\Movement\Domain\Service\StockLedger;

final readonly class InMemoryStockLedger implements StockLedger
{
    public function __construct(private StockMovementRepository $stockMovementRepository)
    {
    }

    public function summaryOf(string $kind, string $refId): StockLedgerSummary
    {
        $movements = $this->stockMovementRepository->findAllByReference(kind: $kind, refId: $refId);
        $anchor = self::lastCount(movements: $movements);

        $balance = null === $anchor ? 0.0 : $anchor->quantity;
        $inferredSquaredFlow = 0.0;

        foreach ($movements as $movement) {
            if (!self::countsAfterAnchor(movement: $movement, anchor: $anchor)) {
                continue;
            }

            $balance += $movement->quantity;

            if (!$movement->isInferred()) {
                continue;
            }

            $inferredSquaredFlow += $movement->quantity * $movement->quantity;
        }

        return new StockLedgerSummary(
            balance: round(num: $balance, precision: StockMovement::QUANTITY_PRECISION),
            observedQuantity: $anchor?->quantity,
            observedConfidence: $anchor?->statedConfidence(),
            inferredSquaredFlow: $inferredSquaredFlow,
        );
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

    private static function countsAfterAnchor(StockMovement $movement, ?StockMovement $anchor): bool
    {
        if (StockMovement::TYPE_DELTA !== $movement->type) {
            return false;
        }

        return null === $anchor || $movement->effectiveAt > $anchor->effectiveAt;
    }

    private static function isLaterThan(StockMovement $movement, StockMovement $other): bool
    {
        if ($movement->effectiveAt != $other->effectiveAt) {
            return $movement->effectiveAt > $other->effectiveAt;
        }

        return $movement->createdAt >= $other->createdAt;
    }
}
