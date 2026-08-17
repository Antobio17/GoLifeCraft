<?php

namespace Economy\Finance\Transaction\Domain\QueryModel;

interface UpdateFinanceTransactionNeedleDataQuery
{
    public function accountExists(string $accountId): bool;
}
