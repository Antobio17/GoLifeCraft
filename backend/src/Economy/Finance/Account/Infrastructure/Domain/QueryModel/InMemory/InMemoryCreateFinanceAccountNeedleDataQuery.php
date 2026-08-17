<?php

namespace Economy\Finance\Account\Infrastructure\Domain\QueryModel\InMemory;

use Economy\Finance\Account\Domain\QueryModel\CreateFinanceAccountNeedleDataQuery;

final class InMemoryCreateFinanceAccountNeedleDataQuery implements CreateFinanceAccountNeedleDataQuery
{
    /**
     * @param array<int, string> $names
     */
    public function __construct(
        private array $names = [],
    ) {
    }

    public function alreadyExists(string $name): bool
    {
        return in_array(needle: $name, haystack: $this->names, strict: true);
    }
}
