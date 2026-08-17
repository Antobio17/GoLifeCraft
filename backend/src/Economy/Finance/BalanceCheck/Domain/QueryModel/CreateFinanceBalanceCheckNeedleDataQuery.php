<?php

namespace Economy\Finance\BalanceCheck\Domain\QueryModel;

interface CreateFinanceBalanceCheckNeedleDataQuery
{
    public function accountExists(string $accountId): bool;

    public function alreadyExists(string $accountId, string $checkDate): bool;
}
