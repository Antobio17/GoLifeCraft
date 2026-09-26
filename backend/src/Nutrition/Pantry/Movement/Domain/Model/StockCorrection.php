<?php

namespace Nutrition\Pantry\Movement\Domain\Model;

use Nutrition\Catalog\Article\Domain\Model\ArticlePack;
use Nutrition\Pantry\Movement\Domain\Exception\CorrectArticleStockException;

final readonly class StockCorrection
{
    public const string KIND_MEASURED = 'measured';
    public const string KIND_DELTA = 'delta';
    public const string KIND_FRACTION = 'fraction';

    public const float CONFIDENCE_COUNTED = 1.0;
    public const float CONFIDENCE_MEASURED = 0.85;
    public const float CONFIDENCE_FRACTION = 0.7;

    private const float MAX_FRACTION = 20.0;

    private function __construct(
        public string $movementType,
        public float $quantity,
        public ?string $unit,
        public ?float $confidence,
    ) {
    }

    public static function fromKind(string $kind, float $quantity, ?string $unit, ArticlePack $pack): self
    {
        $unit = '' !== $unit ? $unit : null;

        return match ($kind) {
            self::KIND_MEASURED => self::measured(quantity: $quantity, unit: $unit),
            self::KIND_DELTA => new self(
                movementType: StockMovement::TYPE_DELTA,
                quantity: $quantity,
                unit: $unit,
                confidence: null,
            ),
            self::KIND_FRACTION => self::fraction(fraction: $quantity, pack: $pack),
            default => throw CorrectArticleStockException::unknownKind(kind: $kind),
        };
    }

    private static function measured(float $quantity, ?string $unit): self
    {
        if ($quantity < 0.0) {
            throw CorrectArticleStockException::quantityCannotBeNegative(quantity: $quantity);
        }

        return new self(
            movementType: StockMovement::TYPE_COUNT,
            quantity: $quantity,
            unit: $unit,
            confidence: 0.0 === $quantity ? self::CONFIDENCE_COUNTED : self::CONFIDENCE_MEASURED,
        );
    }

    private static function fraction(float $fraction, ArticlePack $pack): self
    {
        if ($fraction < 0.0 || $fraction > self::MAX_FRACTION) {
            throw CorrectArticleStockException::fractionIsOutOfRange(fraction: $fraction, max: self::MAX_FRACTION);
        }

        if (0.0 === $fraction) {
            return self::measured(quantity: 0.0, unit: null);
        }

        if (!$pack->isDefined()) {
            throw CorrectArticleStockException::packIsUnknown();
        }

        return new self(
            movementType: StockMovement::TYPE_COUNT,
            quantity: $fraction,
            unit: $pack->unit,
            confidence: self::CONFIDENCE_FRACTION,
        );
    }
}
