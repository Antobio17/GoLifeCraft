<?php

namespace Economy\Finance\Account\Domain\QueryModel;

use Economy\Finance\Account\Domain\QueryModel\Dto\GetFinanceAccountsResult;

interface GetFinanceAccountsNeedleDataQuery
{
    public function findAccounts(string $date): GetFinanceAccountsResult;
}
