<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

use Nutrition\Pantry\Movement\Domain\Model\StockLevel;

final readonly class StockEstimate
{
    public function __construct(
        public float $quantity,
        public StockTrackingMode $trackingMode,
        public float $confidence,
        public ?float $uncertainty,
        public ?float $minQuantity,
        public ?float $maxQuantity,
        public StockLevel $level,
        public ?float $referenceQuantity,
        public ?\DateTime $observedAt,
        public ?float $observedQuantity,
        public int $inferredCount,
        public float $inferredFlow,
    ) {
    }

    public function worstCase(): float
    {
        return $this->minQuantity ?? $this->quantity;
    }

    public function bestCase(): float
    {
        return $this->maxQuantity ?? $this->quantity;
    }
}
