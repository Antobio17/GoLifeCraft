<?php

namespace Economy\Finance\Transaction\Domain\QueryModel;

interface CreateFinanceTransactionNeedleDataQuery
{
    public function accountExists(string $accountId): bool;
}
