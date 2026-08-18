<?php

namespace Economy\Finance\Recurrence\Infrastructure\Domain\QueryModel\InMemory;

use Economy\Finance\Recurrence\Domain\QueryModel\UpdateFinanceRecurrenceNeedleDataQuery;

final class InMemoryUpdateFinanceRecurrenceNeedleDataQuery implements UpdateFinanceRecurrenceNeedleDataQuery
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
