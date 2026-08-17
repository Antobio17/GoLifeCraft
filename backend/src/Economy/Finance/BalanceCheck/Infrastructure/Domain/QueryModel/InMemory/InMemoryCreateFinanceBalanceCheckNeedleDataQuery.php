<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\Domain\QueryModel\InMemory;

use Economy\Finance\BalanceCheck\Domain\QueryModel\CreateFinanceBalanceCheckNeedleDataQuery;

final class InMemoryCreateFinanceBalanceCheckNeedleDataQuery implements CreateFinanceBalanceCheckNeedleDataQuery
{
    /**
     * @param array<int, string> $accountIds
     * @param array<int, string> $takenDatesByAccountId account id and date joined by a pipe
     */
    public function __construct(
        private array $accountIds = [],
        private array $takenDatesByAccountId = [],
    ) {
    }

    public function accountExists(string $accountId): bool
    {
        return in_array(needle: $accountId, haystack: $this->accountIds, strict: true);
    }

    public function alreadyExists(string $accountId, string $checkDate): bool
    {
        return in_array(
            needle: $accountId.'|'.$checkDate,
            haystack: $this->takenDatesByAccountId,
            strict: true,
        );
    }
}
