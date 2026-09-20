<?php

namespace Nutrition\Pantry\Movement\Domain\Model;

use Nutrition\Pantry\Movement\Domain\Exception\CorrectArticleStockException;

final readonly class StockCorrection
{
    public const string KIND_MEASURED = 'measured';
    public const string KIND_DELTA = 'delta';
    public const string KIND_FRACTION = 'fraction';
    public const string KIND_LEVEL = 'level';

    /** @var array<int, string> */
    public const array KINDS = [
        self::KIND_MEASURED,
        self::KIND_DELTA,
        self::KIND_FRACTION,
        self::KIND_LEVEL,
    ];

    public const float CONFIDENCE_COUNTED = 1.0;
    public const float CONFIDENCE_MEASURED = 0.85;
    public const float CONFIDENCE_FRACTION = 0.7;
    public const float CONFIDENCE_LEVEL = 0.5;

    private const float MAX_FRACTION = 20.0;

    private function __construct(
        public string $kind,
        public float $amount,
        public ?string $unit,
        public ?StockLevel $level,
        public ?float $confidence,
    ) {
    }

    public static function fromKind(string $kind, ?float $quantity, ?string $unit, ?string $level): self
    {
        if (self::KIND_MEASURED === $kind) {
            return self::measured(quantity: $quantity, unit: $unit);
        }

        if (self::KIND_DELTA === $kind) {
            return self::delta(quantity: $quantity, unit: $unit);
        }

        if (self::KIND_FRACTION === $kind) {
            return self::fraction(fraction: $quantity);
        }

        if (self::KIND_LEVEL === $kind) {
            return self::level(level: $level);
        }

        throw CorrectArticleStockException::unknownKind(kind: $kind);
    }

    public static function measured(?float $quantity, ?string $unit): self
    {
        if (null === $quantity) {
            throw CorrectArticleStockException::quantityIsRequired(kind: self::KIND_MEASURED);
        }

        if ($quantity < 0.0) {
            throw CorrectArticleStockException::quantityCannotBeNegative(quantity: $quantity);
        }

        return new self(
            kind: self::KIND_MEASURED,
            amount: $quantity,
            unit: '' !== $unit ? $unit : null,
            level: null,
            confidence: 0.0 === $quantity ? self::CONFIDENCE_COUNTED : self::CONFIDENCE_MEASURED,
        );
    }

    public static function delta(?float $quantity, ?string $unit): self
    {
        if (null === $quantity) {
            throw CorrectArticleStockException::quantityIsRequired(kind: self::KIND_DELTA);
        }

        return new self(
            kind: self::KIND_DELTA,
            amount: $quantity,
            unit: '' !== $unit ? $unit : null,
            level: null,
            confidence: null,
        );
    }

    public static function fraction(?float $fraction): self
    {
        if (null === $fraction) {
            throw CorrectArticleStockException::quantityIsRequired(kind: self::KIND_FRACTION);
        }

        if ($fraction < 0.0 || $fraction > self::MAX_FRACTION) {
            throw CorrectArticleStockException::fractionIsOutOfRange(fraction: $fraction, max: self::MAX_FRACTION);
        }

        return new self(
            kind: self::KIND_FRACTION,
            amount: $fraction,
            unit: null,
            level: null,
            confidence: 0.0 === $fraction ? self::CONFIDENCE_COUNTED : self::CONFIDENCE_FRACTION,
        );
    }

    public static function level(?string $level): self
    {
        $stockLevel = null !== $level ? StockLevel::tryFrom(value: $level) : null;

        if (null === $stockLevel || StockLevel::UNKNOWN === $stockLevel) {
            throw CorrectArticleStockException::unknownLevel(level: (string) $level);
        }

        return new self(
            kind: self::KIND_LEVEL,
            amount: $stockLevel->fractionOfReference(),
            unit: null,
            level: $stockLevel,
            confidence: $stockLevel->needsReference() ? self::CONFIDENCE_LEVEL : self::CONFIDENCE_COUNTED,
        );
    }

    public function movementType(): string
    {
        return self::KIND_DELTA === $this->kind
            ? StockMovement::TYPE_DELTA
            : StockMovement::TYPE_COUNT;
    }

    public function needsReference(): bool
    {
        if (self::KIND_MEASURED === $this->kind || self::KIND_DELTA === $this->kind) {
            return false;
        }

        if (self::KIND_LEVEL === $this->kind) {
            return $this->level->needsReference();
        }

        return $this->amount > 0.0;
    }

    public function declaredQuantity(ArticleStockReference $reference): float
    {
        if (!$this->needsReference()) {
            return self::KIND_LEVEL === $this->kind || self::KIND_FRACTION === $this->kind
                ? 0.0
                : $this->amount;
        }

        if ($reference->hasPack()) {
            return $this->amount;
        }

        $resolved = $reference->resolve();

        if (null === $resolved) {
            throw CorrectArticleStockException::referenceIsUnknown(kind: $this->kind);
        }

        return $this->amount * $resolved;
    }

    public function declaredUnit(ArticleStockReference $reference): ?string
    {
        if (self::KIND_MEASURED === $this->kind || self::KIND_DELTA === $this->kind) {
            return $this->unit;
        }

        if (!$this->needsReference()) {
            return null;
        }

        return $reference->hasPack() ? $reference->packUnit : null;
    }
}
