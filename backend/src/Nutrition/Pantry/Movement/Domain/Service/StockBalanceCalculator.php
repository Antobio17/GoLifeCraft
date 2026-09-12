<?php

namespace Nutrition\Pantry\Movement\Domain\Service;

interface StockBalanceCalculator
{
    public function balanceFor(string $kind, string $refId): float;
}
