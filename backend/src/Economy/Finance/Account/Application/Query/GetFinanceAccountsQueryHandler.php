<?php

namespace Economy\Finance\Account\Application\Query;

use Economy\Finance\Account\Domain\QueryModel\GetFinanceAccountsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetFinanceAccountsQueryHandler
{
    public function __construct(
        private GetFinanceAccountsNeedleDataQuery $needleDataQuery,
        private GetFinanceAccountsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetFinanceAccountsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            accounts: $this->needleDataQuery->findAccounts(date: $query->date),
        );
    }
}
