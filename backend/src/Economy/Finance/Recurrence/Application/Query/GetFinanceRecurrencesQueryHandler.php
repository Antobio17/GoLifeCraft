<?php

namespace Economy\Finance\Recurrence\Application\Query;

use Economy\Finance\Recurrence\Domain\QueryModel\GetFinanceRecurrencesNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetFinanceRecurrencesQueryHandler
{
    public function __construct(
        private GetFinanceRecurrencesNeedleDataQuery $needleDataQuery,
        private GetFinanceRecurrencesDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetFinanceRecurrencesQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            recurrences: $this->needleDataQuery->findRecurrences(accountId: $query->accountId),
        );
    }
}
