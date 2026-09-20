<?php

namespace Nutrition\Pantry\Movement\Domain\Service;

use Nutrition\Pantry\Movement\Domain\Model\StockLedgerSummary;

interface StockLedgerSummarizer
{
    public function summarize(string $kind, string $refId): StockLedgerSummary;
}
