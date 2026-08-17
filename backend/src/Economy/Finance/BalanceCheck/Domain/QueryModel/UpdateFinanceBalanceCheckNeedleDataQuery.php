<?php

namespace Economy\Finance\BalanceCheck\Domain\QueryModel;

interface UpdateFinanceBalanceCheckNeedleDataQuery
{
    public function alreadyExists(string $accountId, string $checkDate, string $financeBalanceCheckId): bool;
}
