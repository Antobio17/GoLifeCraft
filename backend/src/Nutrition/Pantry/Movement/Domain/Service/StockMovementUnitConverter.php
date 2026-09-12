<?php

namespace Nutrition\Pantry\Movement\Domain\Service;

interface StockMovementUnitConverter
{
    public function toBaseUnits(string $articleId, float $quantity, ?string $unit): float;
}
