<?php

namespace Economy\Finance\Transaction\Infrastructure\Domain\QueryModel\InMemory;

use Economy\Finance\Transaction\Domain\QueryModel\CreateFinanceTransactionNeedleDataQuery;

final class InMemoryCreateFinanceTransactionNeedleDataQuery implements CreateFinanceTransactionNeedleDataQuery
{
    /**
     * @param array<int, string> $accountIds
     */
    public function __construct(
        private array $accountIds = [],
    ) {
    }

    public function accountExists(string $accountId): bool
    {
        return in_array(needle: $accountId, haystack: $this->accountIds, strict: true);
    }
}
