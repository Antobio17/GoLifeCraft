<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

use Nutrition\Pantry\Movement\Domain\Model\StockLedgerSummary;
use Nutrition\Pantry\Movement\Domain\Model\StockLevel;

final readonly class StockEstimate
{
    public const float INFERENCE_ERROR_RATE = 0.15;
    public const float DRIFT_PER_DAY = 0.02;
    public const float UNOBSERVED_CONFIDENCE = 0.4;
    public const float SCALE_FLOOR_RATIO = 0.25;
    public const int PRECISION = 4;
    public const int CONFIDENCE_PRECISION = 2;

    private const float SECONDS_PER_DAY = 86400.0;

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

    public static function from(
        StockLedgerSummary $summary,
        StockTrackingMode $trackingMode,
        ?float $packSize,
        ?float $previousReference,
        \DateTime $now,
    ): StockEstimate {
        $quantity = round(num: $summary->balance, precision: self::PRECISION);
        $reference = self::referenceFor(
            summary: $summary,
            packSize: $packSize,
            previousReference: $previousReference,
            quantity: $quantity,
        );

        if (!$trackingMode->isTracked()) {
            return self::untracked(summary: $summary, quantity: $quantity, reference: $reference);
        }

        if (!$trackingMode->toleratesDrift()) {
            return self::exact(summary: $summary, quantity: $quantity, reference: $reference);
        }

        $uncertainty = round(
            num: self::uncertaintyFor(summary: $summary, reference: $reference, quantity: $quantity, now: $now),
            precision: self::PRECISION,
        );
        $minQuantity = round(num: max(0.0, $quantity - $uncertainty), precision: self::PRECISION);

        return new self(
            quantity: $quantity,
            trackingMode: StockTrackingMode::APPROXIMATE,
            confidence: self::confidenceFor(quantity: $quantity, reference: $reference, uncertainty: $uncertainty),
            uncertainty: $uncertainty,
            minQuantity: $minQuantity,
            maxQuantity: round(num: max($minQuantity, $quantity + $uncertainty), precision: self::PRECISION),
            level: StockLevel::of(quantity: $quantity, referenceQuantity: $reference),
            referenceQuantity: $reference,
            observedAt: $summary->observedAt,
            observedQuantity: $summary->observedQuantity,
            inferredCount: $summary->inferredCount,
            inferredFlow: round(num: $summary->inferredFlow, precision: self::PRECISION),
        );
    }

    private static function untracked(StockLedgerSummary $summary, float $quantity, ?float $reference): StockEstimate
    {
        return new self(
            quantity: $quantity,
            trackingMode: StockTrackingMode::NONE,
            confidence: 0.0,
            uncertainty: null,
            minQuantity: null,
            maxQuantity: null,
            level: StockLevel::UNKNOWN,
            referenceQuantity: $reference,
            observedAt: $summary->observedAt,
            observedQuantity: $summary->observedQuantity,
            inferredCount: $summary->inferredCount,
            inferredFlow: round(num: $summary->inferredFlow, precision: self::PRECISION),
        );
    }

    private static function exact(StockLedgerSummary $summary, float $quantity, ?float $reference): StockEstimate
    {
        return new self(
            quantity: $quantity,
            trackingMode: StockTrackingMode::EXACT,
            confidence: 1.0,
            uncertainty: 0.0,
            minQuantity: $quantity,
            maxQuantity: $quantity,
            level: StockLevel::of(quantity: $quantity, referenceQuantity: $reference),
            referenceQuantity: $reference,
            observedAt: $summary->observedAt,
            observedQuantity: $summary->observedQuantity,
            inferredCount: $summary->inferredCount,
            inferredFlow: round(num: $summary->inferredFlow, precision: self::PRECISION),
        );
    }

    private static function uncertaintyFor(
        StockLedgerSummary $summary,
        ?float $reference,
        float $quantity,
        \DateTime $now,
    ): float {
        $span = $reference ?? abs($quantity);

        if (0.0 === $span) {
            return 0.0;
        }

        $observedConfidence = $summary->observedConfidence ?? self::UNOBSERVED_CONFIDENCE;
        $observationError = (1.0 - $observedConfidence) * self::scaleFor(
            quantity: $summary->observedQuantity ?? $quantity,
            reference: $span,
        );
        $inferenceError = self::INFERENCE_ERROR_RATE * sqrt($summary->inferredSquaredFlow);
        $driftError = self::DRIFT_PER_DAY * $span * self::daysBetween(since: $summary->driftingSince(), now: $now);

        $uncertainty = sqrt($observationError ** 2 + $inferenceError ** 2 + $driftError ** 2);

        return min($uncertainty, max($span, abs($quantity)));
    }

    private static function confidenceFor(float $quantity, ?float $reference, float $uncertainty): float
    {
        $scale = self::scaleFor(quantity: $quantity, reference: $reference);

        if ($scale <= 0.0) {
            return 0.0;
        }

        return round(num: $scale / ($scale + $uncertainty), precision: self::CONFIDENCE_PRECISION);
    }

    private static function scaleFor(float $quantity, ?float $reference): float
    {
        return max(abs($quantity), ($reference ?? 0.0) * self::SCALE_FLOOR_RATIO);
    }

    private static function referenceFor(
        StockLedgerSummary $summary,
        ?float $packSize,
        ?float $previousReference,
        float $quantity,
    ): ?float {
        if (null !== $packSize && $packSize > 0.0) {
            return round(num: $packSize, precision: self::PRECISION);
        }

        $observedPeak = max($previousReference ?? 0.0, $summary->observedQuantity ?? 0.0);

        if ($observedPeak > 0.0) {
            return round(num: $observedPeak, precision: self::PRECISION);
        }

        return $quantity > 0.0 ? $quantity : null;
    }

    private static function daysBetween(?\DateTime $since, \DateTime $now): float
    {
        if (null === $since) {
            return 0.0;
        }

        return max(0.0, ($now->getTimestamp() - $since->getTimestamp()) / self::SECONDS_PER_DAY);
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
