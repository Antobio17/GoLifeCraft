<?php

namespace Economy\Finance\BalanceCheck\Domain\QueryModel;

interface SetFinanceAccountBalanceNeedleDataQuery
{
    /**
     * Net amount booked by an account on a single day: incomes minus expenses.
     */
    public function netMovements(string $accountId, string $checkDate): float;
}
