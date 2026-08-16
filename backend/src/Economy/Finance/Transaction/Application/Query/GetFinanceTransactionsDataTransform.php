<?php

namespace Economy\Finance\Transaction\Application\Query;

use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceTransactionsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetFinanceTransactionsDataTransform
{
    public function transform(GetFinanceTransactionsResult $transactions): QueryResult;
}
