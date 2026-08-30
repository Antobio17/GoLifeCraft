<?php

namespace Nutrition\Kitchen\Production\Domain\Model;

use Nutrition\Kitchen\Production\Domain\Model\ProductionItemConsumption as Consumption;

final readonly class ProductionCompositionLine
{
    public const int QUANTITY_PRECISION = 4;

    public function __construct(
        public string $kind,
        public string $refId,
        public float $quantity,
        public ?string $unit,
        public float $displayQuantity,
        public ?string $displayUnit,
        public ?string $sourceProductionItemId = null,
    ) {
    }

    public static function article(
        string $articleId,
        float $baseQuantity,
        string $baseUnit,
        float $displayQuantity,
        string $displayUnit,
    ): self {
        return new self(
            kind: Consumption::KIND_ARTICLE,
            refId: $articleId,
            quantity: self::round(value: $baseQuantity),
            unit: $baseUnit,
            displayQuantity: self::round(value: $displayQuantity),
            displayUnit: $displayUnit,
        );
    }

    public static function subRecipe(string $recipeId, float $servings, ?string $sourceProductionItemId = null): self
    {
        return new self(
            kind: Consumption::KIND_RECIPE,
            refId: $recipeId,
            quantity: self::round(value: $servings),
            unit: null,
            displayQuantity: self::round(value: $servings),
            displayUnit: null,
            sourceProductionItemId: $sourceProductionItemId,
        );
    }

    public function servedBy(?string $sourceProductionItemId): self
    {
        return new self(
            kind: $this->kind,
            refId: $this->refId,
            quantity: $this->quantity,
            unit: $this->unit,
            displayQuantity: $this->displayQuantity,
            displayUnit: $this->displayUnit,
            sourceProductionItemId: $sourceProductionItemId,
        );
    }

    public function isArticle(): bool
    {
        return Consumption::KIND_ARTICLE === $this->kind;
    }

    public function scale(float $factor): self
    {
        return new self(
            kind: $this->kind,
            refId: $this->refId,
            quantity: self::round(value: $this->quantity * $factor),
            unit: $this->unit,
            displayQuantity: self::round(value: $this->displayQuantity * $factor),
            displayUnit: $this->displayUnit,
            sourceProductionItemId: $this->sourceProductionItemId,
        );
    }

    /**
     * @param self[] $lines
     *
     * @return self[]
     */
    public static function scaleAll(array $lines, float $factor): array
    {
        return array_map(callback: static fn (self $line): self => $line->scale(factor: $factor), array: array_values(array: $lines));
    }

    public static function round(float $value): float
    {
        return round(num: $value, precision: self::QUANTITY_PRECISION);
    }
}
