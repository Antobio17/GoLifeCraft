<?php

namespace Economy\Finance\Account\Application\Query;

use Economy\Finance\Account\Domain\QueryModel\Dto\GetFinanceAccountsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetFinanceAccountsDataTransform
{
    public function transform(GetFinanceAccountsResult $accounts): QueryResult;
}
