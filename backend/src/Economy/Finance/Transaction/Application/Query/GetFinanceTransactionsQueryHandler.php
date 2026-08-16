<?php

namespace Economy\Finance\Transaction\Application\Query;

use Economy\Finance\Transaction\Domain\QueryModel\GetFinanceTransactionsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetFinanceTransactionsQueryHandler
{
    public function __construct(
        private GetFinanceTransactionsNeedleDataQuery $needleDataQuery,
        private GetFinanceTransactionsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetFinanceTransactionsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            transactions: $this->needleDataQuery->findTransactions(month: $query->month, date: $query->date),
        );
    }
}
