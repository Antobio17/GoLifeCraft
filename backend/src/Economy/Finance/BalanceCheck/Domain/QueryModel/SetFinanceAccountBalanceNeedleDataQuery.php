<?php

namespace Economy\Finance\BalanceCheck\Domain\QueryModel;

interface SetFinanceAccountBalanceNeedleDataQuery
{
    public function netMovements(string $accountId, string $checkDate): float;
}
