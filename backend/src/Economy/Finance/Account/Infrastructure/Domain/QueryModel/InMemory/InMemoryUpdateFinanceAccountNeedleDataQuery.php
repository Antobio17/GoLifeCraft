<?php

namespace Economy\Finance\Account\Infrastructure\Domain\QueryModel\InMemory;

use Economy\Finance\Account\Domain\QueryModel\UpdateFinanceAccountNeedleDataQuery;

final class InMemoryUpdateFinanceAccountNeedleDataQuery implements UpdateFinanceAccountNeedleDataQuery
{
    /**
     * @param array<string, string> $namesByAccountId
     */
    public function __construct(
        private array $namesByAccountId = [],
    ) {
    }

    public function alreadyExists(string $name, string $financeAccountId): bool
    {
        foreach ($this->namesByAccountId as $accountId => $existingName) {
            if ($existingName === $name && $accountId !== $financeAccountId) {
                return true;
            }
        }

        return false;
    }
}
