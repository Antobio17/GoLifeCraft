<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

final readonly class StockNeed
{
    public const float TRUSTED_CONFIDENCE = 0.8;

    public function __construct(
        public float $neededQuantity,
        public float $stockQuantity,
        public ?float $minQuantity,
        public ?float $maxQuantity,
        public float $confidence,
        public StockSufficiency $sufficiency,
        public float $deficit,
        public float $safeDeficit,
        public ?int $packs,
        public ?int $safePacks,
    ) {
    }

    public static function assess(StockEstimate $estimate, float $neededQuantity, ?float $packSize): self
    {
        $deficit = max(0.0, $neededQuantity - $estimate->quantity);
        $safeDeficit = max(0.0, $neededQuantity - $estimate->worstCase());

        return new self(
            neededQuantity: $neededQuantity,
            stockQuantity: $estimate->quantity,
            minQuantity: $estimate->minQuantity,
            maxQuantity: $estimate->maxQuantity,
            confidence: $estimate->confidence,
            sufficiency: self::sufficiencyOf(estimate: $estimate, neededQuantity: $neededQuantity),
            deficit: $deficit,
            safeDeficit: $safeDeficit,
            packs: self::packsFor(quantity: $deficit, packSize: $packSize),
            safePacks: self::packsFor(quantity: $safeDeficit, packSize: $packSize),
        );
    }

    private static function sufficiencyOf(StockEstimate $estimate, float $neededQuantity): StockSufficiency
    {
        if (!$estimate->trackingMode->isTracked()) {
            return StockSufficiency::UNKNOWN;
        }

        if ($neededQuantity <= 0.0) {
            return StockSufficiency::SUFFICIENT;
        }

        if ($estimate->worstCase() >= $neededQuantity) {
            return StockSufficiency::SUFFICIENT;
        }

        if ($estimate->bestCase() < $neededQuantity) {
            return $estimate->confidence >= self::TRUSTED_CONFIDENCE
                ? StockSufficiency::INSUFFICIENT
                : StockSufficiency::PROBABLY_INSUFFICIENT;
        }

        return $estimate->quantity >= $neededQuantity
            ? StockSufficiency::PROBABLY_SUFFICIENT
            : StockSufficiency::PROBABLY_INSUFFICIENT;
    }

    private static function packsFor(float $quantity, ?float $packSize): ?int
    {
        if (null === $packSize || $packSize <= 0.0) {
            return null;
        }

        if ($quantity <= 0.0) {
            return 0;
        }

        return max(1, (int) ceil($quantity / $packSize));
    }
}
