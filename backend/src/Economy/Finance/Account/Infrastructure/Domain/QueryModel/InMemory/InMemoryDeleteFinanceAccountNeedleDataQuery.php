<?php

namespace Economy\Finance\Account\Infrastructure\Domain\QueryModel\InMemory;

use Economy\Finance\Account\Domain\QueryModel\DeleteFinanceAccountNeedleDataQuery;

final class InMemoryDeleteFinanceAccountNeedleDataQuery implements DeleteFinanceAccountNeedleDataQuery
{
    /**
     * @param array<int, string> $accountIdsWithTransactions
     */
    public function __construct(
        private array $accountIdsWithTransactions = [],
    ) {
    }

    public function hasTransactions(string $financeAccountId): bool
    {
        return in_array(needle: $financeAccountId, haystack: $this->accountIdsWithTransactions, strict: true);
    }
}
