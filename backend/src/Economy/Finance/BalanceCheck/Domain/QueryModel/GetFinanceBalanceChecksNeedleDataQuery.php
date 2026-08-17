<?php

namespace Economy\Finance\BalanceCheck\Domain\QueryModel;

use Economy\Finance\BalanceCheck\Domain\QueryModel\Dto\GetFinanceBalanceChecksResult;

interface GetFinanceBalanceChecksNeedleDataQuery
{
    public function findChecks(?string $financeAccountId): GetFinanceBalanceChecksResult;
}
