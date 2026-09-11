<?php

namespace Nutrition\Pantry\Stock\Domain\Service;

interface ArticleStockUnitConverter
{
    public function toBaseUnits(string $articleId, float $quantity, ?string $unit): float;
}
