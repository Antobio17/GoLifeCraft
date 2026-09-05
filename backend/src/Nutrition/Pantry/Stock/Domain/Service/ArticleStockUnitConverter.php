<?php

namespace Nutrition\Pantry\Stock\Domain\Service;

interface ArticleStockUnitConverter
{
    /**
     * Turns a quantity expressed in any of the article aliases into the base units ("g"/"ml")
     * the stock is kept in. An unknown alias, the base unit itself or no unit at all leave the
     * quantity untouched.
     */
    public function toBaseUnits(string $articleId, float $quantity, ?string $unit): float;
}
