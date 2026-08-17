<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\Domain\QueryModel\InMemory;

use Economy\Finance\BalanceCheck\Domain\QueryModel\SetFinanceAccountBalanceNeedleDataQuery;

final class InMemorySetFinanceAccountBalanceNeedleDataQuery implements SetFinanceAccountBalanceNeedleDataQuery
{
    /**
     * @param array<string, float> $netMovementsByAccountDate net amount indexed by account id and date joined by a pipe
     */
    public function __construct(
        private array $netMovementsByAccountDate = [],
    ) {
    }

    public function netMovements(string $accountId, string $checkDate): float
    {
        return $this->netMovementsByAccountDate[$accountId.'|'.$checkDate] ?? 0.0;
    }
}
