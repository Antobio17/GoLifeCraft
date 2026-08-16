<?php

namespace Economy\Finance\Transaction\Application\Query;

use Economy\Finance\Transaction\Domain\QueryModel\GetFinanceOverviewNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetFinanceOverviewQueryHandler
{
    public function __construct(
        private GetFinanceOverviewNeedleDataQuery $needleDataQuery,
        private GetFinanceOverviewDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetFinanceOverviewQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            overview: $this->needleDataQuery->findOverview(month: $query->month, today: $query->today),
        );
    }
}
