<?php

namespace Nutrition\Pantry\Movement\Domain\Model;

final readonly class StockLedgerSummary
{
    public function __construct(
        public float $balance,
        public ?float $observedQuantity,
        public ?\DateTime $observedAt,
        public ?float $observedConfidence,
        public float $inferredFlow,
        public float $inferredSquaredFlow,
        public int $inferredCount,
        public ?\DateTime $firstUnanchoredAt,
    ) {
    }

    public static function empty(): self
    {
        return new self(
            balance: 0.0,
            observedQuantity: null,
            observedAt: null,
            observedConfidence: null,
            inferredFlow: 0.0,
            inferredSquaredFlow: 0.0,
            inferredCount: 0,
            firstUnanchoredAt: null,
        );
    }

    public function hasObservation(): bool
    {
        return null !== $this->observedAt;
    }

    public function driftingSince(): ?\DateTime
    {
        return $this->observedAt ?? $this->firstUnanchoredAt;
    }
}
