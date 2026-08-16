<?php

namespace Economy\Finance\Transaction\Infrastructure\UI\API\DataTransform;

use Economy\Finance\Transaction\Application\Query\GetFinanceTransactionsDataTransform;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceTransactionsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetFinanceTransactionsDataTransform implements GetFinanceTransactionsDataTransform
{
    public function transform(GetFinanceTransactionsResult $transactions): QueryResult
    {
        return new QuerySingleResult(item: $transactions);
    }
}
