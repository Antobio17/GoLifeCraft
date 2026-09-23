<?php

namespace Nutrition\Pantry\Movement\Domain\Service;

use Nutrition\Pantry\Movement\Domain\Model\StockLedgerSummary;

interface StockLedger
{
    public function summaryOf(string $kind, string $refId): StockLedgerSummary;
}
