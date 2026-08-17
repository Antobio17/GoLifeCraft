<?php

namespace Economy\Finance\Account\Domain\QueryModel;

interface DeleteFinanceAccountNeedleDataQuery
{
    public function hasTransactions(string $financeAccountId): bool;
}
