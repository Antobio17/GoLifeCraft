<?php

namespace Economy\Finance\BalanceCheck\Application\Query;

use Economy\Finance\BalanceCheck\Domain\QueryModel\GetFinanceBalanceChecksNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetFinanceBalanceChecksQueryHandler
{
    public function __construct(
        private GetFinanceBalanceChecksNeedleDataQuery $needleDataQuery,
        private GetFinanceBalanceChecksDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetFinanceBalanceChecksQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            checks: $this->needleDataQuery->findChecks(financeAccountId: $query->financeAccountId),
        );
    }
}
