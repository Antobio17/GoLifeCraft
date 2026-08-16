<?php

namespace Economy\Finance\Transaction\Domain\QueryModel;

use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceTransactionsResult;

interface GetFinanceTransactionsNeedleDataQuery
{
    public function findTransactions(string $month, ?string $date): GetFinanceTransactionsResult;
}
