<?php

namespace Nutrition\Pantry\Movement\Domain\Model;

final readonly class StockLedgerSummary
{
    public function __construct(
        public float $balance,
        public ?float $observedQuantity,
        public ?float $observedConfidence,
        public float $inferredSquaredFlow,
    ) {
    }
}
