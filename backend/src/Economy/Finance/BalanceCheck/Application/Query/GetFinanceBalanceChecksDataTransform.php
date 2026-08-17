<?php

namespace Economy\Finance\BalanceCheck\Application\Query;

use Economy\Finance\BalanceCheck\Domain\QueryModel\Dto\GetFinanceBalanceChecksResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetFinanceBalanceChecksDataTransform
{
    public function transform(GetFinanceBalanceChecksResult $checks): QueryResult;
}
