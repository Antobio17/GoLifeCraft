<?php

namespace Economy\Finance\Budget\Application\Query;

use Economy\Finance\Budget\Domain\QueryModel\GetFinanceBudgetNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetFinanceBudgetQueryHandler
{
    public function __construct(
        private GetFinanceBudgetNeedleDataQuery $needleDataQuery,
        private GetFinanceBudgetDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetFinanceBudgetQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            budget: $this->needleDataQuery->findBudget(month: $query->month, today: $query->today),
        );
    }
}
