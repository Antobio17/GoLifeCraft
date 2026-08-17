<?php

namespace Economy\Finance\Account\Domain\Service;

interface FinanceBalanceReader
{
    /**
     * Balance of every account at the end of the given day, anchored on the latest
     * balance check registered at or before that day. Movements of the check day
     * itself are already applied on top of the checked amount.
     *
     * @return array<string, float> account id indexed balances
     */
    public function balancesAt(string $date): array;

    public function balanceAt(string $financeAccountId, string $date): float;
}
