<?php

namespace Economy\Finance\Account\Domain\QueryModel;

interface UpdateFinanceAccountNeedleDataQuery
{
    public function alreadyExists(string $name, string $financeAccountId): bool;
}
