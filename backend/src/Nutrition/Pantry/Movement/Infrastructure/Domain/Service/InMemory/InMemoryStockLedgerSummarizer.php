<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\Service\InMemory;

use Nutrition\Pantry\Movement\Domain\Model\StockLedgerSummary;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Model\StockMovementRepository;
use Nutrition\Pantry\Movement\Domain\Service\StockLedgerSummarizer;

final readonly class InMemoryStockLedgerSummarizer implements StockLedgerSummarizer
{
    public function __construct(private StockMovementRepository $stockMovementRepository)
    {
    }

    public function summarize(string $kind, string $refId): StockLedgerSummary
    {
        $movements = $this->stockMovementRepository->findAllByReference(kind: $kind, refId: $refId);
        $anchor = self::lastCount(movements: $movements);

        $balance = null === $anchor ? 0.0 : $anchor->quantity;
        $inferredFlow = 0.0;
        $inferredSquaredFlow = 0.0;
        $inferredCount = 0;
        $firstUnanchoredAt = null;

        foreach ($movements as $movement) {
            if (!self::countsAfterAnchor(movement: $movement, anchor: $anchor)) {
                continue;
            }

            $balance += $movement->quantity;
            $firstUnanchoredAt = self::earliest(current: $firstUnanchoredAt, candidate: $movement->effectiveAt);

            if (!$movement->evidence()->blursQuantity()) {
                continue;
            }

            $inferredFlow += abs($movement->quantity);
            $inferredSquaredFlow += $movement->quantity * $movement->quantity;
            ++$inferredCount;
        }

        return new StockLedgerSummary(
            balance: round(num: $balance, precision: StockMovement::QUANTITY_PRECISION),
            observedQuantity: $anchor?->quantity,
            observedAt: $anchor?->effectiveAt,
            observedConfidence: $anchor?->statedConfidence(),
            inferredFlow: $inferredFlow,
            inferredSquaredFlow: $inferredSquaredFlow,
            inferredCount: $inferredCount,
            firstUnanchoredAt: $firstUnanchoredAt,
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

    private static function earliest(?\DateTime $current, \DateTime $candidate): \DateTime
    {
        if (null === $current) {
            return $candidate;
        }

        return $candidate < $current ? $candidate : $current;
    }

    private static function isLaterThan(StockMovement $movement, StockMovement $other): bool
    {
        if ($movement->effectiveAt != $other->effectiveAt) {
            return $movement->effectiveAt > $other->effectiveAt;
        }

        return $movement->createdAt >= $other->createdAt;
    }
}
