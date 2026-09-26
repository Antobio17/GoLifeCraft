<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

use Nutrition\Pantry\Movement\Domain\Model\StockLedgerSummary;

final readonly class StockEstimate
{
    public const float INFERENCE_ERROR_RATE = 0.15;
    public const float UNOBSERVED_CONFIDENCE = 0.4;
    public const float SCALE_FLOOR_RATIO = 0.25;
    public const int PRECISION = 4;
    public const int CONFIDENCE_PRECISION = 2;

    private function __construct(
        public float $quantity,
        public float $confidence,
        public ?float $minQuantity,
        public ?float $maxQuantity,
        public StockLevel $level,
    ) {
    }

    public static function from(
        StockLedgerSummary $summary,
        StockTrackingMode $trackingMode,
        ?float $packSize,
    ): self {
        $quantity = round(num: $summary->balance, precision: self::PRECISION);
        $level = StockLevel::of(quantity: $quantity, packSize: $packSize);

        if (StockTrackingMode::NONE === $trackingMode) {
            return new self(
                quantity: $quantity,
                confidence: 0.0,
                minQuantity: null,
                maxQuantity: null,
                level: StockLevel::UNKNOWN,
            );
        }

        if (StockTrackingMode::EXACT === $trackingMode) {
            return new self(
                quantity: $quantity,
                confidence: 1.0,
                minQuantity: $quantity,
                maxQuantity: $quantity,
                level: $level,
            );
        }

        $uncertainty = self::uncertaintyFor(summary: $summary, packSize: $packSize, quantity: $quantity);
        $minQuantity = round(num: max(0.0, $quantity - $uncertainty), precision: self::PRECISION);

        return new self(
            quantity: $quantity,
            confidence: self::confidenceFor(quantity: $quantity, packSize: $packSize, uncertainty: $uncertainty),
            minQuantity: $minQuantity,
            maxQuantity: round(num: max($minQuantity, $quantity + $uncertainty), precision: self::PRECISION),
            level: $level,
        );
    }

    private static function uncertaintyFor(StockLedgerSummary $summary, ?float $packSize, float $quantity): float
    {
        $span = $packSize ?? abs($quantity);

        if (0.0 === $span) {
            return 0.0;
        }

        $observedConfidence = $summary->observedConfidence ?? self::UNOBSERVED_CONFIDENCE;
        $observationError = (1.0 - $observedConfidence) * self::scaleFor(
            quantity: $summary->observedQuantity ?? $quantity,
            packSize: $span,
        );
        $inferenceError = self::INFERENCE_ERROR_RATE * sqrt($summary->inferredSquaredFlow);

        return min(sqrt($observationError ** 2 + $inferenceError ** 2), max($span, abs($quantity)));
    }

    private static function confidenceFor(float $quantity, ?float $packSize, float $uncertainty): float
    {
        $scale = self::scaleFor(quantity: $quantity, packSize: $packSize);

        if ($scale <= 0.0) {
            return 0.0;
        }

        return round(num: $scale / ($scale + $uncertainty), precision: self::CONFIDENCE_PRECISION);
    }

    private static function scaleFor(float $quantity, ?float $packSize): float
    {
        return max(abs($quantity), ($packSize ?? 0.0) * self::SCALE_FLOOR_RATIO);
    }
}
