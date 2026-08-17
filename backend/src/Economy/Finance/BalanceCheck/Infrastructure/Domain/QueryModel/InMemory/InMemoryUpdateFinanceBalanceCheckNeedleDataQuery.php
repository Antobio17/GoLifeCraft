<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\Domain\QueryModel\InMemory;

use Economy\Finance\BalanceCheck\Domain\QueryModel\UpdateFinanceBalanceCheckNeedleDataQuery;

final class InMemoryUpdateFinanceBalanceCheckNeedleDataQuery implements UpdateFinanceBalanceCheckNeedleDataQuery
{
    /**
     * @param array<string, string> $takenDatesByCheckId check id indexed "accountId|checkDate" entries
     */
    public function __construct(
        private array $takenDatesByCheckId = [],
    ) {
    }

    public function alreadyExists(string $accountId, string $checkDate, string $financeBalanceCheckId): bool
    {
        foreach ($this->takenDatesByCheckId as $checkId => $taken) {
            if ($taken === $accountId.'|'.$checkDate && $checkId !== $financeBalanceCheckId) {
                return true;
            }
        }

        return false;
    }
}
